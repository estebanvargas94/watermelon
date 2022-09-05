import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import saveUserInfo from "../utils/db/jira/saveUserInfo";
export default function Jira({ organization, avatar_url, error }) {
  console.log(organization, avatar_url, error);
  const [timeToRedirect, setTimeToRedirect] = useState(5);
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeToRedirect(timeToRedirect - 1);
      if (timeToRedirect === 0) {
        router.push("/");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeToRedirect]);

  return (
    <div>
      <h1>You have logged in with Jira to {organization}</h1>
      <img src={avatar_url} alt="jira organization image" />
      <div>
        <p>You will be redirected in {timeToRedirect}...</p>
        <p>
          If you are not redirected, please click{" "}
          <Link href="/">
            <a>here</a>
          </Link>
        </p>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  let f;
  if (context.query.code) {
    f = await fetch(`https://github.com/login/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: context.query.code,
        redirect_uri: "https://app.watermelon.tools/github",
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
      }),
    });
  } else
    return {
      props: {
        error: "no code",
      },
    };
  const json = await f.json();
  if (json.error) {
    return {
      props: {
        error: json.error,
      },
    };
  } else {
    console.log(json);

    return {
      props: { loggedIn: true },
    };
  }
}
