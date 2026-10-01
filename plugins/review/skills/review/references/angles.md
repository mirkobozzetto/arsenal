# Reader briefs, one per angle

Each reader gets exactly one brief, the scope and the user's worry. A
finding needs a file, a line and evidence from the code; an opinion without
evidence is not returned. Empty results are valid.

## bugs

Logic errors, wrong conditions, off-by-one, unhandled errors and empty or
missing values, race conditions, resources never released, behaviour that
contradicts the function's name or comment.

## security

Untrusted input reaching a shell, a query, a path, HTML or a deserializer
unchecked; secrets in code or logs; missing authorization on a route or
action; unsafe defaults; vulnerable dependency versions (verify online).

## simplicity

Code that could be deleted or replaced: duplicates of an existing helper,
reimplemented standard library, abstractions with a single use, dead code,
configuration for a value that never changes, needless dependencies.

## performance

Repeated work in loops, queries in loops, blocking calls on hot paths,
unbounded growth, loading far more than used. Only with a plausible cost.

## consistency

What is not logical: code that contradicts a brief, proposal or issue in
scope, two modules that disagree on the same rule, a name that lies, a
documented behaviour the code does not have, a feature half wired. The lead
passes the planned work (briefs, proposals, open issues) in the brief.

## other

A domain the user names (accessibility, i18n, tests, API design...). The
lead writes a three-line brief for it in the same shape as above.
