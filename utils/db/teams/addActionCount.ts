import executeRequest from "../azuredb";

export default async ({ owner }) => {
  let query = await executeRequest(
    `EXEC dbo.increment_owner_github_app_uses @watermelon_user = '${owner}'`
  );
  return query;
};
