# 🚀 Lifecycle MCP Quick Reference Card

## 🔧 Setup
```bash
export LIFECYCLE_DB="$(pwd)/lifecycle.db"
claude mcp list | grep lifecycle
```

## 📊 Status & Monitoring
```bash
# Project health dashboard
mcp__lifecycle__get_project_status include_blocked=true

# Export full documentation
mcp__lifecycle__export_project_documentation \
  project_name="YourProject" \
  output_directory="./docs"

# Create diagrams
mcp__lifecycle__create_architectural_diagrams \
  diagram_type="full_project"  # or: requirements|tasks|architecture|dependencies
```

## 📝 Requirements
```bash
# Interactive creation (recommended)
mcp__lifecycle__start_requirement_interview \
  project_context="Your project description" \
  stakeholder_role="Product Owner"

# Direct creation
mcp__lifecycle__create_requirement \
  type="FUNC"  # FUNC|NFUNC|TECH|BUS|INTF
  title="Clear requirement title" \
  priority="P1"  # P0|P1|P2|P3
  current_state="What exists now" \
  desired_state="What you want"

# Query & manage
mcp__lifecycle__query_requirements status="Approved"
mcp__lifecycle__get_requirement_details requirement_id="REQ-0001-FUNC-00"
mcp__lifecycle__update_requirement_status \
  requirement_id="REQ-0001-FUNC-00" \
  new_status="Ready"  # See state diagram
```

## ✅ Tasks
```bash
# Create task from requirement
mcp__lifecycle__create_task \
  requirement_ids=["REQ-0001-FUNC-00"] \
  title="Implementation task" \
  priority="P1" \
  effort="M"  # XS|S|M|L|XL

# Manage tasks
mcp__lifecycle__query_tasks status="Not Started"
mcp__lifecycle__update_task_status \
  task_id="TASK-0001-00-00" \
  new_status="In Progress"  # Not Started|In Progress|Blocked|Complete|Abandoned

# GitHub sync
mcp__lifecycle__sync_task_from_github task_id="TASK-0001-00-00"
mcp__lifecycle__bulk_sync_github_tasks
```

## 🏛️ Architecture Decisions
```bash
# Interactive design (for complex systems)
mcp__lifecycle__start_architectural_conversation \
  diagram_purpose="System architecture" \
  complexity_level="complex"  # simple|medium|complex

# Create ADR
mcp__lifecycle__create_architecture_decision \
  requirement_ids=["REQ-0001-FUNC-00"] \
  title="Decision title" \
  context="Why this decision is needed" \
  decision="What we decided" \
  consequences={"positive": [...], "negative": [...]}

# Review process
mcp__lifecycle__add_architecture_review \
  architecture_id="ADR-0001" \
  comment="Review feedback"

mcp__lifecycle__update_architecture_status \
  architecture_id="ADR-0001" \
  new_status="Accepted"  # See state diagram
```

## 🔍 Traceability
```bash
# Trace requirement implementation
mcp__lifecycle__trace_requirement requirement_id="REQ-0001-FUNC-00"

# Search across entities
mcp__lifecycle__query_requirements search_text="authentication"
mcp__lifecycle__query_tasks assignee="john@team.com"
mcp__lifecycle__query_architecture_decisions status="Accepted"
```

## 📋 State Transitions

### Requirements
```
Draft → Under Review → Approved → Architecture → Ready → Implemented → Validated → Deprecated
```

### Tasks
```
Not Started → In Progress → Complete
           ↘     ↓      ↗
              Blocked → Abandoned
```

### Architecture
```
Draft → Proposed → Accepted → Implemented
      ↘         ↘  Rejected  ↗
        Under Review → Deprecated/Superseded
```

## 🏷️ ID Formats
- **Requirements**: `REQ-XXXX-TYPE-VV` (e.g., REQ-0001-FUNC-00)
- **Tasks**: `TASK-XXXX-YY-ZZ` (e.g., TASK-0001-00-00)
- **Architecture**: `ADR-XXXX` (e.g., ADR-0001)

## 💡 Pro Tips
1. Start with interactive sessions for complex items
2. Always trace requirements before marking complete
3. Use meaningful titles - they appear in reports
4. Update status in real-time for accurate tracking
5. Export documentation regularly for stakeholders

## 🔧 Troubleshooting
```bash
# Check MCP connection
claude mcp list | grep lifecycle

# Verify database location
echo $LIFECYCLE_DB

# Query everything to debug
mcp__lifecycle__query_requirements
mcp__lifecycle__query_tasks
mcp__lifecycle__query_architecture_decisions
```