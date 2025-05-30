export const generateSpherePositions = () => {
  const particlesCount = 8000; // Increased for better visual effect
  const positions = new Float32Array(particlesCount * 3); // fixed to *3, as you assign 3 coords per particle
  const radius = 12;

  for (let i = 0; i < particlesCount; i++) {
    // Using spherical coordinates for more uniform distribution
    const phi = Math.acos(-1 + (2 * i) / particlesCount);
    const theta = Math.sqrt(particlesCount * Math.PI) * phi;
    positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return { positions, particlesCount };
};
