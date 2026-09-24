#!/usr/bin/env python3
"""Export poll data from the old SQLite database as D1 INSERT statements."""

import argparse
import os
import sqlite3
from pathlib import Path

TABLES = (
    ("Poll", ("id", "slug", "title", "description", "timezone", "createdAt")),
    ("Timeslot", ("id", "pollId", "date", "startTime", "endTime", "order")),
    ("Invitee", ("id", "pollId", "name", "isAdmin", "timeZone", "timeZoneLabel", "email", "note")),
    ("Participant", ("id", "pollId", "name", "submittedAt")),
    ("Vote", ("id", "participantId", "timeslotId", "value")),
)


def literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.output.exists():
        parser.error(f"Output already exists: {args.output}")

    connection = sqlite3.connect(f"file:{args.source.resolve()}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    statements = []
    counts = {}

    for table, columns in TABLES:
        rows = connection.execute(f'SELECT * FROM "{table}"').fetchall()
        counts[table] = len(rows)
        quoted_columns = ", ".join(f'"{column}"' for column in columns)
        for row in rows:
            values = ", ".join(
                literal(0 if table == "Invitee" and column == "isAdmin" and column not in row.keys() else row[column])
                for column in columns
            )
            statements.append(f'INSERT INTO "{table}" ({quoted_columns}) VALUES ({values});')

    connection.close()
    fd = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w") as output:
        output.write("\n".join(statements) + "\n")

    print(f"Exported {counts} to {args.output}.")
    print("Existing polls are never replaced. Keep this SQL file private.")


if __name__ == "__main__":
    main()
