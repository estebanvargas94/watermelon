import executeRequest from "../azuredb";

export default async ({
  access_token,
  id,
  avatar_url,
  watermelon_user,
  name,
  email,
  location
}) => {
  let query = `EXEC dbo.create_bitbucket @watermelon_user='${watermelon_user}', @id='${id}', @avatar_url='${avatar_url}', @name='${name}', @email='${email}', @location='${location}', @access_token='${access_token}'`;
  let resp = await executeRequest(query);
  return resp;
};
