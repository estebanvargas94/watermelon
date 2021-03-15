function Login() {
  return (
    <div className="flex justify-center items-center">
      <div className="rounded shadow">
        <h1>Login</h1>
        <p>We need to know who you are to help you better.</p>
        <a href="https://slack.com/oauth/v2/authorize?user_scope=identity.basic,identity.email,identity.team,identity.avatar&client_id=1471534976662.1575212081829&redirect_uri=https://app.watermelon.tools/firstAuth">
          <img
            alt="Sign in with Slack"
            height="40"
            width="172"
            src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
            srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
          />
        </a>
      </div>
    </div>
  );
}

export default Login;
