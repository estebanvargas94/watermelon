import Link from "next/link";
import { getServerSession } from "next-auth";
//change this to import correctly
import saveUserInfo from "../../utils/db/slack/saveUser";

import { authOptions } from "../api/auth/[...nextauth]/route";
import TimeToRedirect from "../../components/redirect";
import getAllPublicUserData from "../../utils/api/getAllUserPublicData";
// the recommended services should not be of the same category as the current one
import LinearLoginLink from "../../components/LinearLoginLink";
import JiraLoginLink from "../../components/JiraLoginLink";
import ConfluenceLoginLink from "../../components/ConfluenceLoginLink";
import GitHubLoginLink from "../../components/GitHubLoginLink";

export default async function ServicePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const userName = session?.user?.name;
  const { code, state } = searchParams;
  let error = "";
  // change service name
  const serviceName = "Slack";
  const [userData, serviceToken] = await Promise.all([
    getAllPublicUserData({ userEmail }).catch((e) => {
      console.error(e);
      return null;
    }),
    // change this fetch
    fetch(`https://slack.com/api/oauth.v2.access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${context.query.code}&redirect_uri=https://app.watermelontools.com/slack&client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}`,
    }),
  ]);

  // the recommended services should not be of the same category as the current one
  const services = [
    {
      name: "GitHub",
      dataProp: "github_data",
      loginComponent: <GitHubLoginLink userEmail={userEmail} />,
    },
    {
      name: "Linear",
      dataProp: "linear_data",
      loginComponent: <LinearLoginLink userEmail={userEmail} />,
    },
    {
      name: "Confluence",
      dataProp: "confluence_data",
      loginComponent: <ConfluenceLoginLink userEmail={userEmail} />,
    },
    {
      name: "Jira",
      dataProp: "jira_data",
      loginComponent: <JiraLoginLink userEmail={userEmail} />,
    },
  ];
  const loginArray = services
    .map((service) =>
      userData?.[service.dataProp] ? null : service.loginComponent
    )
    .filter((component) => component !== null);

  const json = await serviceToken.json();
  if (json.error) {
    error = json.error;
  } else {
    const { authed_user } = json;
    const userInfo = await fetch(
      `https://slack.com/api/users.info?user=${authed_user.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authed_user.access_token}`,
        },
      }
    );
    let userJson = await userInfo.json();
    // save user correctly
    await saveUserInfo({
      user_token: authed_user.access_token,
      bot_token: json.access_token,
      bot_user_id: json.bot_user_id,
      user_id: authed_user.id,
      team_id: json.team.id,
      team_name: json.team.name,
      bot_scopes: json.scope,
      user_scopes: authed_user.scope,
      incoming_webhook_channel_id: json.incoming_webhook.channel_id,
      watermelon_user: state,
      incoming_webhook_configuration_url:
        json.incoming_webhook.configuration_url,
      incoming_webhook_url: json.incoming_webhook.url,
      is_enterprise_install: json.is_enterprise_install,
      user_username: userJson.user.name,
      user_title: userJson.user.profile.title,
      user_real_name: userJson.user.real_name,
      user_picture_url: userJson.user.profile.image_512,
    });

    return (
      <div className="Box" style={{ maxWidth: "100ch", margin: "auto" }}>
        <div className="Subhead">
          <h2 className="Subhead-heading px-2">
            You have logged in with {serviceName} as{" "}
            {userJson.viewer.displayName} in the team{" "}
            {userJson.teams.nodes[0].name}
          </h2>
        </div>
        <img
          src={userJson.viewer.avatarUrl}
          alt="linear user image"
          className="avatar avatar-8"
        />
        <div>
          <TimeToRedirect url={"/"} />
          <p>
            If you are not redirected, please click <Link href="/">here</Link>
          </p>
          {loginArray.length ? (
            <div>
              <h3>You might also be interested: </h3>
              {loginArray.map((login) => (
                <>{login}</>
              ))}
            </div>
          ) : null}
          {error && <p>{error}</p>}
        </div>
      </div>
    );
  }
}
