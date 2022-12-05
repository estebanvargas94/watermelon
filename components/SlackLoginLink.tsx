import Link from "next/link";

// This conditional render is the fastest solution towards manually onboarding our first paid customers
// We will replace this with a more robust solution in the near future
// This will happen once we release the billing page, which will allow companies to sign up for a paid plan via self-serve
// Until then, we will manually add the companies and their employees to the database
const SlackLoginLink = ({ userEmail, hasPaid }) => (
  <div>
    {hasPaid ? (
      (<Link
        href={`https://slack.com/oauth/v2/authorize?client_id=2258283433764.3516691319939&scope=incoming-webhook,chat:write,chat:write.customize,channels:history,groups:history,mpim:history,im:history&user_scope=chat:write,users:read,search:read,channels:history,groups:history,mpim:history,im:history&state=${userEmail}`}
        className="button block">

        <div className="Box d-flex flex-items-center flex-justify-start p-2">
          <img className="avatar avatar-8" src="/logos/slack.svg" />
          <div className="p-2">
            <h2>Login to Slack</h2>
            <p>View your Most Relevant Threads and Groups</p>
          </div>
        </div>

      </Link>)
    ) : (
      (<Link
        href={`https://app.watermelontools.com/billing/adminDetails`}
        className="button block">

        <div className="Box d-flex flex-items-center flex-justify-start p-2">
          <img className="avatar avatar-8" src="/logos/slack.svg" />
          <div className="p-2">
            <h2>Activate Slack</h2>
            <p>Upgrade your plan to find context from your chats</p>
          </div>
        </div>

      </Link>)
    )}
  </div>
);
export default SlackLoginLink;
