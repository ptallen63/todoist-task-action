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
    due_string: dueString,
  }

  if (projectId) body.project_id = projectId;

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

  try {
   // Get inputs
   const taskContent = core.getInput('task-content');
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

    core.setOutput('response-message', res);

  } catch (error) {
    core.setFailed(error.message);
  }
})()