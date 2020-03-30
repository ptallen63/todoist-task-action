const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const todoistApiUrl = "https://api.todoist.com/rest/v1";

/**
 *  Take in a project name and return the project Id in todoist if exists
 * @param {String} projectName Name of project
 * @param {String} token Api Key for Todoist
 */
const getProjectIdFromName = async (projectName, token) => {
  // Get All Projects
  const res = await axios.get(`${todoistApiUrl}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  // Filter all project by name and pop off
  // TODO: Would be Cool to do some fuzzy matching here
  const project = res.data
    .filter(p => p.name === projectName)
    .pop()
  return project ? project.id : null;
}

/**
 *
 * @param {String} tokent todoist api key
 * @param {Object} options
 * @param {Number} options.projectId todoist project id
 * @param {String} options.content content for task
 * @param {String} options.dueString Human readable due string
 */
const createTask = async ( token, { projectId, content, dueString }) => {
  // Buidl request body object
  const body = {
    content,
  }

  // if there are options present add them tot he request
  if (projectId) body.project_id = projectId;
  if (dueString) body.due_string = dueString;

  // Make reques to todoist
  const res = await axios(`${todoistApiUrl}/tasks`,{
    method: "POST",
    data: body,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": 'application/json'
    }
  })

  // Return the data
  return res.data;
}

(async () => {
  try {
    const { context } = github;
    if (context.eventName !== "issues") throw Error("Can Only be used with Issues right now")

    const { issue, repository } = context.payload;

   // Get inputs
    const taskContent = `${issue.title} *${repository.full_name}]* [ issue 🔗](${issue.html_url})`;
    const projectName = core.getInput('project-name');
    const dueString = core.getInput('due-string');
    const token = core.getInput('token');

   // Get project id from todoist project;
    const projectId = await getProjectIdFromName(projectName, token);

    // Create the task
    const res = await createTask(token, {
      content: taskContent,
      projectId: projectId,
      dueString: dueString,
    })

    core.setOutput('response-message', JSON.stringify(res, null, 2));

  } catch (error) {
    core.setFailed(error.message);
  }
})()