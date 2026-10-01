# UX Synthesis Framework

Analyze Mobbin results through these lenses, then structure output using the appropriate template.

---

## Part 1: Analysis Lenses

### 1. Screen Moment
What part of the user journey is this? (First launch, onboarding, core task, settings, error recovery, etc.)

### 2. User Job
What is the user trying to accomplish at this moment? What triggered them to be on this screen?

### 3. Information Hierarchy
What appears first, second, and last? What gets the most visual weight? What is the reading order?

### 4. Trust Mechanism
How does the interface reduce uncertainty or anxiety? Look for: security messages, fee breakdowns, confirmation checklists, familiar brand cues, social proof, progress indicators.

### 5. Action Model
What is the primary CTA? What is secondary? Is there a destructive action, and how is it visually separated? How many actions compete for attention?

### 6. Progressive Disclosure
What is hidden until needed? Look for: expandable sections, "learn more" links, advanced settings behind toggles, tooltips, info icons.

### 7. Recovery
What happens when the user is blocked, makes an error, or wants to go back? Look for: error states, undo options, back buttons, help links, retry mechanisms.

### 8. Reusable Pattern
What specific UI pattern could be extracted and applied to the user's product? Name it concretely (e.g., "inline fee breakdown with expandable details" not "good transparency").

---

## Part 2: Output Templates

Choose the template that best fits the user's research goal.

### Template A: Research Summary (default)

Use when the user wants to understand patterns across a category or flow type.

```
# Mobbin Research Summary

## Research Goal
Briefly restate the goal.

## Searches Used
List the concrete Mobbin queries used and platform(s) searched.

## Pattern Clusters
Group findings into recurring UI patterns. Attribute each to specific apps.

## Key Observations
Explain what the screens reveal about product design thinking.

## UX Opportunities
Translate findings into design opportunities for the user's product.

## Recommendations
Give concrete, actionable design recommendations.

## Reusable Patterns
List reusable UI patterns the user can apply, with app references.
```

### Template B: Competitive Comparison

Use when the user wants to compare how different apps handle the same screen or flow.

```
# Competitive UI Comparison

## Screen / Flow Compared
What specific moment is being compared.

## Comparison Table

| App | Pattern | Strength | Weakness | Reusable Idea |
|-----|---------|----------|----------|---------------|
| ... | ...     | ...      | ...      | ...           |

## Winner Analysis
Which approach works best and why.

## Recommendation
What the user's product should adopt, combine, or avoid.
```

### Template C: Product Decision Log

Use when the user wants to formalize research into a design decision.

```
# Product Decision Log

## Context
What prompted this research. What product area is affected.

## Problem
The specific UX problem being solved.

## Options Considered
List the patterns found, with app references.

## Decision
The recommended approach.

## Rationale
Why this approach, grounded in the Mobbin findings.

## Consequences
What this decision enables and constrains.

## Success Metrics
How to measure whether this decision worked.
```

---

## Choosing a Template

- User says "research X patterns" or "how do apps handle X" -> **Template A**
- User says "compare how apps do X" or "competitive audit" -> **Template B**
- User says "help me decide" or "what should we do for X" -> **Template C**
- If unclear, default to **Template A** and offer to convert to another format.
