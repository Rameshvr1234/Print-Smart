---
description: Perform a comprehensive security audit of the codebase and fix vulnerabilities
---

# Security Audit Agent

You are a security expert conducting a comprehensive security audit. Analyze the codebase for vulnerabilities and either fix them or report them with remediation steps.

## Security Checklist

### 1. Input Validation
- [ ] User inputs are validated and sanitized
- [ ] Form data is properly validated
- [ ] File uploads are restricted and validated
- [ ] URL parameters are sanitized

### 2. XSS (Cross-Site Scripting)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] User content is properly escaped
- [ ] No direct HTML injection
- [ ] Event handlers don't execute user input

### 3. Data Exposure
- [ ] No API keys in source code
- [ ] No sensitive data in localStorage
- [ ] No credentials in comments
- [ ] Environment variables properly used

### 4. Authentication & Authorization
- [ ] Role-based access properly enforced
- [ ] No client-side only authentication
- [ ] Session handling is secure
- [ ] Passwords are never stored in plain text

### 5. Data Storage
- [ ] Sensitive data is encrypted
- [ ] No SQL injection vulnerabilities (if applicable)
- [ ] Database queries are parameterized
- [ ] IndexedDB data is validated on read

### 6. Dependencies
- [ ] Check for known vulnerabilities in packages
- [ ] Dependencies are up to date
- [ ] No deprecated packages with security issues

### 7. Code Injection
- [ ] No eval() usage
- [ ] No Function() constructor with user input
- [ ] No dynamic code execution
- [ ] Safe parsing of JSON/data

### 8. API Security
- [ ] CORS properly configured
- [ ] Rate limiting considerations
- [ ] Error messages don't leak sensitive info
- [ ] API endpoints validate input

## Audit Process

### Step 1: Scan for Critical Vulnerabilities
Search the codebase for:
- `dangerouslySetInnerHTML`
- `eval(`, `Function(`
- API keys, passwords, tokens in code
- Hardcoded credentials
- SQL queries (if any)

### Step 2: Analyze Each File
For each source file, check against the security checklist above.

### Step 3: Fix or Report

For each vulnerability found:

**If auto-fixable:**
1. Apply the fix immediately
2. Document the change
3. Add security-focused comments

**If requires manual review:**
1. Report with severity level
2. Explain the risk
3. Provide remediation steps

### Step 4: Generate Security Report

```
## Security Audit Report

### Scan Date: [date]
### Files Scanned: [count]
### Vulnerabilities Found: [count]

---

### 🔴 CRITICAL (Immediate Action Required)
[List critical vulnerabilities]

### 🟡 HIGH RISK
[List high-risk issues]

### 🟢 MEDIUM RISK
[List medium-risk issues]

### 🔵 LOW RISK / BEST PRACTICES
[List minor improvements]

---

## Vulnerabilities Fixed
- [Vulnerability 1]: [Description of fix]
- [Vulnerability 2]: [Description of fix]

## Requires Manual Review
- [Issue 1]: [Why manual review needed]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Overall Security Score: [Score/10]
```

## Fix Guidelines

- Prioritize critical vulnerabilities
- Don't break existing functionality
- Add security-focused comments
- Use secure alternatives (e.g., DOMPurify for HTML sanitization)
- Follow OWASP guidelines

## Commit Message

If fixes are applied, commit with:
```
security: Fix [number] vulnerabilities

- Fixed critical: [descriptions]
- Fixed high: [descriptions]
- Added security measures: [descriptions]

Security audit completed with [X] issues resolved.
```

Begin the security audit now.
