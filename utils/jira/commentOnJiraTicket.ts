import getUserId from "./getUserId";

export default async function handler(req, res) {
  let { cloudId, access_token, text, issueIdOrKey } = req.body;
  let returnVal;
  if (!cloudId) {
    res.send({ error: "no cloudId" });
  }
  if (!access_token) {
    res.send({ error: "no access_token" });
  }
  try {
    await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueIdOrKey}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: "🍉" + text,
                  type: "text",
                },
              ],
            },
          ],
        }),
      }
    )
      .then((res) => {
        console.log(res.body);
        res.json();
      })
      .then((resJson) => {
        console.log(resJson);
        returnVal = resJson;
      });
    return res.send(returnVal);
  } catch (error) {
    console.error(error);
    return res.send(error);
  }
}
