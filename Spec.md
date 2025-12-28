Project spec
1. Product summary

A Chrome extension that helps users complete job applications faster by:

Detecting the question associated with the currently focused input field

Suggesting previously saved answers that match semantically (fuzzy matching)

Allowing one-click fill into the field

Allowing the user to save their final edited answer for future reuse

Optionally tailoring answers using the job description and the user profile

The extension must be user-controlled:

Never auto-submit forms

Never fill sensitive fields automatically

Never store keystrokes globally

Only store answers when the user explicitly clicks Save

2. Personas and use cases
Primary user

A student or job seeker applying to many roles across different ATS platforms.

Core use cases

Structured autofill:

Email, phone, LinkedIn, GitHub, portfolio, address, school, degree, graduation date

Reused short answers:

Work authorization, sponsorship, relocation, start date, salary expectations

Reused long answers:

“Tell me about yourself”

“Why this company”

Behavioral stories

Learning loop:

User types an improved answer, clicks Save, it becomes the new suggested answer later

3. Functional requirements
FR1: Field detection

Detect focus changes on input, textarea, select, and contenteditable.

Support dynamic web apps (React, Angular, custom components).

Track an “active field” state per tab.

FR2: Question extraction

When a field is focused, extract a FieldContext including:

question_text (best label or prompt)

section_heading (closest form section heading)

nearby_text (small text around field container)

field_type (input, textarea, select, checkbox, radio)

input_type (email, tel, url, number, text)

constraints: required, maxlength, pattern, min, max

options for selects and radio groups

url, domain, page title

platform guess (greenhouse, lever, workday, icims, ashby, other)

Question extraction algorithm must prioritize:

<label for>

aria-label, aria-labelledby

wrapper container heuristics

placeholder as last resort

FR3: Suggestions retrieval

On focus:

Query memory store for similar past questions

Return top 5 suggestions with confidence score

Show in UI with preview and “Use” action

Fuzzy matching requirements:

Baseline: lexical + trigram similarity

Upgrade: embeddings based similarity with optional reranking

FR4: Fill action

User clicks “Use” to load suggestion into a draft box

User clicks “Fill” to write into the active field

Must trigger proper input and change events for controlled components

FR5: Save action

User clicks “Save”

Store question, answer, metadata, timestamps, usage counters

Update existing entry if very similar question on same domain (dedupe)

FR6: Memory management UI

Options page must support:

List saved entries with search and filters

Edit an entry

Delete an entry

Export and import JSON

FR7: Profile store

Options page supports “Profile facts” that can be used for structured autofill:

name, email, phone, address

LinkedIn, GitHub, portfolio URL

work auth, sponsorship, relocation, start date, salary range

resume text (import and store)
All profile facts are local only.

FR8: Safety and privacy

Default allowlist mode: extension only runs on user-enabled domains

Sensitive field detection: do not suggest or fill SSN, DOB, passport, bank, government ID

Redaction: if any model call is used later, redact sensitive tokens

Never store job description automatically unless user toggles “Allow JD capture”

FR9: Platform adapters

Add platform-specific heuristics for:

Greenhouse

Lever

Workday
Each adapter improves question extraction and field mapping.

4. Non-functional requirements
NFR1: Performance

On focus, suggestions should appear quickly

Cache FieldContext embeddings and last results per tab

Avoid scanning the entire DOM repeatedly

NFR2: Reliability

Handle iframes when permitted

Work on pages with dynamic content

Graceful fallback when labels cannot be found

NFR3: Storage durability

Use IndexedDB for memory entries and embeddings

chrome.storage.local for settings and small profile fields

Support up to 2000 entries without major lag

NFR4: Security

No remote code execution

Least privileges

No network calls by default

5. Technical architecture
Extension modules

Content script

Focus listener

FieldContext extraction

UI injection

Fill implementation

Message passing to background

Background service worker

Central logic for:

memory CRUD

matching

embeddings pipeline (later)

caching

UI

Injected widget near bottom-right or side panel

Options page

Storage

IndexedDB tables:

memory_entries

embeddings (optional separate store)

chrome.storage.local:

settings

profile

allowlist domains

6. Data model
FieldContext

id: ephemeral

url, domain, title

platform

question_text

section_heading

nearby_text

field_tag (input, textarea, select, div)

input_type

required, maxlength, pattern

options: string[]

element_fingerprint (stable hash to help dedupe per site)

MemoryEntry

id: uuid

question_text

answer_text

answer_type (enum)

meta:

domain

platform

section_heading

field_tag

input_type

options_hash

timestamps: created_at, updated_at, last_used_at

usage_count

embeddings:

context_embedding_id optional

answer_embedding_id optional

Profile

structured fields plus resume_text and optional bullet library

Settings

enabled_domains allowlist

run_mode: allowlist_only or all_sites

jd_capture_enabled boolean

embeddings_mode: off, local_companion, api

sensitive_fill_mode: never_fill, warn_only

7. Matching and ranking
Baseline scoring

score = 0.55 jaccard(tokens(question_text))
+ 0.35 trigram_similarity(question_text)
+ 0.10 trigram_similarity(section_heading)
+ bonuses for same domain and platform

Embeddings scoring (later)

compute embedding for FieldContext combined text

cosine similarity against stored context embeddings

rerank top 20 with light LLM classifier optionally

8. Sensitive detection rules

Mark a field as sensitive if question or nearby text contains:

ssn, social security

date of birth, dob

passport

driver’s license

bank account, routing

tax id

national id

credit card

Behavior:

Do not auto-fill

Do not show saved suggestions unless user explicitly overrides with “Show anyway”

Always require manual copy

9. Acceptance tests
Field extraction

Label via <label for> returns correct question

aria-label works

aria-labelledby works

wrapper heuristics find a reasonable prompt

Save and retrieve

Save stores entry

Similar question surfaces suggestion

Use loads into draft

Fill writes into actual field and triggers events

Options management

Entries list displays

Edit updates entry

Delete removes entry

Export produces JSON