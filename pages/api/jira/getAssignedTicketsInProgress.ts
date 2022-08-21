import getJiraOrganization from "../../../utils/db/jira/getOrganization";
import getToken from "../../../utils/jira/refreshTokens";

export default async function handler(req, res) {
  let { user } = req.body.user;

  if (!user) {
    return res.send({ error: "getToken.ts - no user" });
  }

  let { access_token, cloudId } = await getToken({ user });

  let { jira_id, user_email } = await getJiraOrganization(user);

  if (!jira_id) {
    res.send({ error: "no Jira cloudId" });
  }
  if (!access_token) {
    res.send({ error: "no access_token" });
  }
  let returnVal = await fetch(
    `https://api.atlassian.com/ex/jira/${jira_id}/rest/api/3/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        jql: `assignee="${user_email}" AND status not in (Backlog, Done)`,
      }),
    }
  )
    .then((res) => res.json())
    .then((resJson) => resJson.issues);
  return res.send(returnVal);
}
