---
description: Automatically analyze the codebase and fix bugs, issues, and code quality problems
---

# Automated Bug Fixing Agent

You are an expert code analyzer and bug fixer. Your task is to systematically analyze the entire codebase, identify bugs and issues, and automatically fix them.

## Step 1: Initial Analysis

First, create a todo list for tracking your analysis and fixes.

Then, analyze the codebase by examining:
- All TypeScript/JavaScript files in the project
- Configuration files (tsconfig.json, vite.config.ts, etc.)
- Dependencies and package.json

## Step 2: Bug Detection

Systematically search for these categories of issues:

### TypeScript Issues
- Type errors and inconsistencies
- Missing type annotations
- `any` types that should be specific
- Unsafe type assertions
- Incorrect generics usage

### React Issues
- Missing keys in lists
- Incorrect hook dependencies (useEffect, useCallback, useMemo)
- Stale closures
- Incorrect state updates
- Memory leaks (missing cleanup in useEffect)
- Improper event handler bindings

### Logic Errors
- Off-by-one errors
- Incorrect conditionals
- Missing null/undefined checks
- Unreachable code
- Incorrect default values
- Race conditions

### Code Quality
- Unused variables and imports
- Dead code
- Duplicate code
- Magic numbers (should be constants)
- Inconsistent naming
- Missing error handling

### Security Issues
- XSS vulnerabilities
- SQL injection (if applicable)
- Unsafe data parsing
- Missing input validation
- Exposed sensitive data

### Performance Issues
- Unnecessary re-renders
- Missing memoization
- Inefficient algorithms
- Memory leaks

## Step 3: Fix the Issues

For each issue found:
1. Update your todo list marking the current issue as in_progress
2. Read the affected file(s)
3. Apply the fix using the Edit tool
4. Mark the issue as completed in your todo list
5. Move to the next issue

## Step 4: Verification

After all fixes:
- Run build command to verify no compilation errors: `npm run build`
- If build fails, fix the errors
- If build succeeds, proceed to commit

## Step 5: Commit Changes

Create a detailed commit with all the fixes:
- List all bug categories fixed
- Mention the number of issues resolved
- Use a clear commit message format

## Important Guidelines

- Be thorough but efficient - focus on actual bugs, not just style preferences
- Make atomic, safe changes
- Preserve existing functionality
- Don't break working code while fixing issues
- If unsure about a fix, document it but don't apply it
- Prioritize critical bugs (crashes, security) over minor issues (style, optimization)

## Output Format

Provide a summary at the end:
```
## Bug Fix Summary

### Issues Found: [number]
### Issues Fixed: [number]
### Categories:
- TypeScript Errors: [count]
- React Issues: [count]
- Logic Errors: [count]
- Code Quality: [count]
- Security: [count]
- Performance: [count]

### Files Modified:
- [file1]: [description]
- [file2]: [description]

### Build Status: [SUCCESS/FAILED]
```

Begin your analysis now.
