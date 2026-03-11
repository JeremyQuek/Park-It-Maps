import { useEffect } from "react";

function Test() {
  useEffect(() => {
    window.location.replace("https://2fff-122-11-212-106.ngrok-free.app/map");
  }, []);

  return <div>Redirecting...</div>;
}

export default Test;
