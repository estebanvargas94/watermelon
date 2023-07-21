import updateTokensFromConfluence from "../../utils/confluence/updateTokens";
import updateTokensInDB from "../../utils/db/confluence/updateTokens";

type ConfluenceResult = { error: string } | any[];
function removeSpecialChars(inputString) {
  const specialChars = '!"#$%&/()=-_"{}¨*[]'; // Edit this list to include or exclude characters
  return inputString
    .split("")
    .filter((char) => !specialChars.includes(char))
    .join("");
}

async function fetchFromConfluence(cql, amount, accessToken) {
  const reqUrl = `https://api.atlassian.com/ex/confluence/${confluence_id}/rest/api/search?cql=${cql}&limit=${amount}`;
  return fetch(reqUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .then((resJson) => resJson.results);
}

async function getConfluence({
  confluence_token,
  confluence_refresh_token,
  confluence_id,
  user,
  randomWords,
  amount = 3,
}): Promise<ConfluenceResult> {
  // Error handling
  if (!confluence_token || !confluence_refresh_token)
    return { error: "no confluence token" };
  if (!user) return { error: "no user" };
  if (!confluence_id) return { error: "no confluence cloudId" };

  // Refresh tokens
  const newAccessTokens = await updateTokensFromConfluence({
    refresh_token: confluence_refresh_token,
  });

  console.log("newAccessTokens", newAccessTokens);

  await updateTokensInDB({
    access_token: newAccessTokens.access_token,
    refresh_token: newAccessTokens.refresh_token,
    user,
  });

  // Constructing search query
  const cleanRandomWords = Array.from(
    new Set(randomWords.map((word) => removeSpecialChars(word)))
  );
  const titleQuery = cleanRandomWords
    .map((word) => `title ~ "${word}"`)
    .join(" OR ");
  const textQuery = cleanRandomWords
    .map((word) => `text ~ "${word}"`)
    .join(" OR ");
  const cql = `(${titleQuery}) OR (${textQuery}) ORDER BY created DESC`;

  // Fetch data from Confluence
  try {
    const results = await fetchFromConfluence(
      cql,
      amount,
      newAccessTokens.access_token
    );
    console.log("Confluence results", results);
    return results;
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch data from Confluence." };
  }
}

export default getConfluence;
