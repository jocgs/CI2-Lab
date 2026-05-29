import os from "os";

const PORT = process.env.PORT ?? "3000";

function getLanAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];

  for (const iface of Object.values(nets)) {
    if (!iface) continue;
    for (const net of iface) {
      if (net.family !== "IPv4" || net.internal) continue;
      addresses.push(net.address);
    }
  }

  return [...new Set(addresses)];
}

const ips = getLanAddresses();

console.log("\n📱 TikiTaka — acceso desde el móvil (misma Wi‑Fi)\n");
if (ips.length === 0) {
  console.log("No se detectó IP local. Ejecuta `ipconfig` y busca IPv4 de Wi‑Fi.\n");
} else {
  for (const ip of ips) {
    console.log(`   http://${ip}:${PORT}`);
  }
  console.log("");
}
console.log("Requisitos:");
console.log("  • PC y móvil en la misma red Wi‑Fi");
console.log("  • Firewall de Windows: permitir Node en red privada");
console.log("  • Arranca con: npm run dev:mobile\n");
