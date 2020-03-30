
# Todoist Task Action

This action creates a Todoist task from a Github action.

🚨 This currently can only be used with an `issues` trigger. 🚨

## Inputs

### `token`

**Required** This is the API Token used with your Todoist account.

[Find Your API KEY](https://todoist.com/Users/viewPrefs?page=integrations)

### `project-name`

The project name you want this task to go to. At the moment it must be an exact match to work.

### `due-string`

This is the human readable due date string to pass to Todoist.

ex: `today` or `next week`

## Outputs

### `response-message`

This is the response message you would get back from todoist

## Example usage

```yml
uses: ptallen63/todoist-task-action
with:
  token: ${{ secrets.TODOIST_API_KEY }}
```


## Future Todos

- [ ] Add fuzzy matching for project names
- [ ] Pass Issue label back
- [ ] Support other action triggers
- [ ] Set up Contribution guide
- [ ] Set Up Linting
