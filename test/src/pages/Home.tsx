import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-center w-full">x402 Demo</h1>
      </div>

      <div className="border-t border-neutral-700 mb-12"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 font-mono text-sm">
            <pre className="whitespace-pre-wrap break-all">
              <h1 className="text-3xl">What you want to test ?</h1>
              <br />
              <br />
              <h1
                className="text-2xl cursor-pointer"
                onClick={() => {
                  navigate("/api");
                }}
              >
                Api
              </h1>
              <br />
              <h1
                className="text-2xl cursor-pointer"
                onClick={() => {
                  navigate("/wss");
                }}
              >
                Wss
              </h1>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
