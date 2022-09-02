import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

function VSCode() {
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  console.log(data);
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {status !== "loading" && (
        <Link
          href={`vscode://watermelontools.watermelon-tools?email=${
            data?.user?.email ?? ""
          }`}
        >
          <a>click to login with vscode</a>
        </Link>
      )}
    </div>
  );
}

export default VSCode;
