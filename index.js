const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');

const baseURL = "https://api.todoist.com/rest/v1";

const getProjectIdFromName = async (name, token) => {

  // Get Projects
  const response = await axios.get(`${baseURL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  const project = response.data
    .filter(p => p.name === name)
    .pop()
  return project ? project.id : null;
}

const createTask = async ({
  projectId, content, dueString, token
}) => {
  const body = {
    content,
  }

  if (projectId) body.project_id = projectId;
  if (dueString) body.due_string = dueString;

  const res = await axios(`${baseURL}/tasks`,{
    method: "POST",
    data: body,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-type": 'application/json'
    }
  })

  return res.data;
}

(async () => {

  const { payload } = github.context;
  console.log(payload, payload.eventName);
  if (payload.eventName !== "issues") throw Error("Can Only be used with Issues right now")

  const { issue } = payload;

  try {
   // Get inputs
    const taskContent = `${issue.title} [ issue 🔗](${issue.html_url})`;
    const projectName = core.getInput('project-name');
    const dueString = core.getInput('due-string');
    const token = core.getInput('token');

   // Get All projects
    const projectId = await getProjectIdFromName(projectName, token);

    const res = await createTask({
      content: taskContent,
      projectId: projectId,
      dueString: dueString,
      token,
    })

    core.setOutput('response-message', JSON.stringify(res, null, 2));

  } catch (error) {
    core.setFailed(error.message);
  }
})()