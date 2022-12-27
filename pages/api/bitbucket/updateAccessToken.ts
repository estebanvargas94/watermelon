import updateBitbucketAccessToken from "../../../utils/bitbucket/updateBitbucketAccessToken";

export default async function handler(req, res) {
  let { userEmail } = req.body;
  console.log("updateAccessToken userEmail", userEmail)
  if (!userEmail) {
    return res.send({ error: "no user email" });
  }
  let newAccessToken = await updateBitbucketAccessToken(userEmail);
  return res.send(newAccessToken);
}
