# Test Environments

> **STATUS: NOT DOCUMENTED.** Fill this in before the agent can write test cases
> with concrete, runnable preconditions.

The agent reads this document to write accurate preconditions. Until it is
filled in, generated test cases will say "the test environment" instead of
naming a real one.

---

## 1. Environments

| Environment | Purpose | RMS URL | OMS URL | WMS URL | Refreshed from |
| --- | --- | --- | --- | --- | --- |
| Local | | | | | |
| Dev | | | | | |
| Staging | | | | | |
| Production | Not used for testing | | | | |

---

## 2. Which Environment for Which Change

| Change type | Environment | Why |
| --- | --- | --- |
| | | |

---

## 3. Test Store Setup

The RMS depends on connected stores. Document the stores available for testing.

| Store | Integration type | Environment | Notes |
| --- | --- | --- | --- |
| | Shopify | | |
| | Custom | | |

---

## 4. Access and Credentials

Do **not** put credentials in this repository. Record where they live instead —
a password manager entry name, a vault path, or who to ask.

| What | Where to get it |
| --- | --- |
| Return Panel seller account | |
| Return Portal buyer account | |
| OMS access | |
| WMS access | |
| API / Swagger access | |

---

## 5. Configuration Endpoints

The RMS cargo documentation notes that cargo prices and commission can be
configured through API/Swagger endpoints for testing. Record those here, along
with anything else that has to be set up before a scenario can run.

| What it configures | How | Environment |
| --- | --- | --- |
| Cargo prices and commission | API / Swagger | |

---

## 6. Known Environment Limitations

Things that cannot be tested in a given environment, and the workaround.

| Limitation | Environment | Workaround |
| --- | --- | --- |
| | | |
