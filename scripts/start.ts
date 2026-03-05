import { startSimulation } from "../simulation/scheduler";
import { startApiServer } from "../server/api";
import "../ui/dashboard";
import "../utils/telemetry";

async function main() {
  startApiServer(3001);
  await startSimulation();
}

main();
