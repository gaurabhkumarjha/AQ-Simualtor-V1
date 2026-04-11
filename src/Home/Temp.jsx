import { useState, useEffect } from "react";
import {
  Container,
  Table,
  NumberInput,
  Slider,
  Text,
  Card,
  Grid,
} from "@mantine/core";



const Temp = () => {
  const [zones, setZones] = useState(
    Array.from({ length: 10 }, () => ({
      pop: 0,
      conc: 0,
      reduction: 0,
    }))
  );

  const [result, setResult] = useState({
    totalPop: 0,
    oldAvg: 0,
    newAvg: 0,
    netReduction: 0,
  });

  const updateZone = (index, key, value) => {
    const updated = [...zones];
    updated[index][key] =
      value === "" || value === null ? 0 : Number(value);
    setZones(updated);
  };

  useEffect(() => {
    const totalPop = zones.reduce(
      (sum, z) => sum + Number(z.pop || 0),
      0
    );

    if (totalPop === 0) {
      setResult({
        totalPop: 0,
        oldAvg: 0,
        newAvg: 0,
        netReduction: 0,
      });
      return;
    }

    const oldWeighted = zones.reduce(
      (sum, z) =>
        sum + Number(z.pop || 0) * Number(z.conc || 0),
      0
    );

    const newWeighted = zones.reduce((sum, z) => {
      const pop = Number(z.pop || 0);
      const conc = Number(z.conc || 0);
      const reduction = Number(z.reduction || 0);

      const newConc = conc - (conc * reduction) / 100;
      return sum + pop * newConc;
    }, 0);

    const oldAvg = oldWeighted / totalPop;
    const newAvg = newWeighted / totalPop;

    const netReduction =
      oldAvg === 0 ? 0 : ((oldAvg - newAvg) / oldAvg) * 100;

    setResult({
      totalPop,
      oldAvg,
      newAvg,
      netReduction,
    });
  }, [zones]);

  // 🔥 Visualization logic
  const visualZones = zones
    .map((z, i) => {
      const newZoneAvg =
        Number(z.conc || 0) -
        (Number(z.conc || 0) * Number(z.reduction || 0)) / 100;

      return {
        label: `Z${i + 1}`,
        value: newZoneAvg,
      };
    })
    .filter((z) => z.value > 0);

  const maxVal = Math.max(...visualZones.map((z) => z.value), 0);

  return (
    <Container size="xl" py="md">
      <Text size="xl" fw={700} ta="center" mb="md">
        -- AQ Simulator V1 --
      </Text>

      {/* TABLE */}
      <Card shadow="md" p="md" radius="lg" withBorder>
        <Text size="sm" c="dimmed" mb="xs">
          Green cells are inputs. Use sliders to adjust reduction.
        </Text>

        <div style={{ overflowX: "auto" }}>
          <Table
            striped
            withColumnBorders
            highlightOnHover
            fontSize="md"
            styles={{
              th: { textAlign: "center" },
              td: { textAlign: "center" },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 80, fontSize: "16px" }}>Zone</th>
                <th style={{ width: 120, fontSize: "16px" }}>
                  Population (millions)
                </th>
                <th style={{ width: 120, fontSize: "16px" }}>
                  Avg Conc (µg/m³)
                </th>
                <th style={{ width: 220, fontSize: "16px" }}>
                  % Reduction
                </th>
                <th style={{ width: 120, fontSize: "16px" }}>
                  New Zone Avg
                </th>
              </tr>
            </thead>

            <tbody>
              {zones.map((zone, index) => {
                const newZoneAvg =
                  Number(zone.conc || 0) -
                  (Number(zone.conc || 0) *
                    Number(zone.reduction || 0)) /
                  100;

                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 600 }}>
                      Z{index + 1}
                    </td>

                    {/* Population */}
                    <td style={{ background: "#e6f4ea" }}>
                      <NumberInput
                        value={zone.pop}
                        min={0}
                        hideControls
                        styles={{
                          input: {
                            textAlign: "center",
                            fontSize: "16px",
                            background: "transparent",
                            // border: "none",
                          },
                        }}
                        onChange={(val) =>
                          updateZone(index, "pop", val)
                        }
                      />
                    </td>

                    {/* Avg Conc */}
                    <td style={{ background: "#e6f4ea" }}>
                      <NumberInput
                        value={zone.conc}
                        min={0}
                        hideControls
                        styles={{
                          input: {
                            textAlign: "center",
                            fontSize: "16px",
                            background: "transparent",
                            // border: "none",
                          },
                        }}
                        onChange={(val) =>
                          updateZone(index, "conc", val)
                        }
                      />
                    </td>

                    {/* Slider */}
                    <td>
                      <div style={{ display: "flex", gap: 10 }}>
                        <Slider
                          value={zone.reduction}
                          onChange={(val) =>
                            updateZone(index, "reduction", val)
                          }
                          min={0}
                          max={100}
                          style={{ flex: 1 }}
                          m={'sm'}
                        />
                        <Text size="sm" w={40}>
                          {zone.reduction}%
                        </Text>
                      </div>
                    </td>

                    {/* New Zone Avg */}
                    <td style={{ fontWeight: 500, textAlign: 'center' }}>
                      {newZoneAvg.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* RESULTS */}
      <Card
        shadow="lg"
        mt="md"
        p="lg"
        radius="lg"
        withBorder
        style={{ background: "#f8f9fa" }}
      >
        <Grid>
          <Grid.Col span={3}>
            <Text size="sm" c="dimmed">
              Total Population
            </Text>
            <Text fw={700} size="xl">
              {result.totalPop.toFixed(1)} millions
            </Text>
          </Grid.Col>

          <Grid.Col span={3}>
            <Text size="sm" c="dimmed">
              Pop. Weighted Conc
            </Text>
            <Text fw={700} size="xl" c="blue">
              {result.oldAvg.toFixed(1)} µg/m³
            </Text>
          </Grid.Col>

          <Grid.Col span={3}>
            <Text size="sm" c="dimmed">
              New Weighted Conc
            </Text>
            <Text fw={700} size="xl" c="teal">
              {result.newAvg.toFixed(1)} µg/m³
            </Text>
          </Grid.Col>

          <Grid.Col span={3}>
            <Text size="sm" c="dimmed">
              Net Reduction
            </Text>
            <Text
              fw={700}
              size="xl"
              c={result.netReduction > 0 ? "green" : "red"}
            >
              {result.netReduction.toFixed(1)}%
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* 🔥 VISUALIZATION SECTION */}
      <Card shadow="lg"
        mt="md"
        p="lg"
        radius="lg"
        withBorder style={{ background: "#f8f9fa" }}>
        <Text fw={600} mb="md" ta="center" size="lg">
          Zone Visualization
        </Text>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "30px",
            minHeight: "200px",
          }}
        >
          {visualZones.map((z, i) => {
            const size =
              maxVal === 0
                ? 60
                : (z.value / maxVal) * 120 + 60; // better scaling

            const gradients = [
              "linear-gradient(135deg, #4dabf7, #228be6)",
              "linear-gradient(135deg, #51cf66, #2f9e44)",
              "linear-gradient(135deg, #ffd43b, #fab005)",
              "linear-gradient(135deg, #ff6b6b, #c92a2a)",
              "linear-gradient(135deg, #845ef7, #5f3dc4)",
              "linear-gradient(135deg, #20c997, #0ca678)",
            ];

            return (
              <div
                key={i}
                title={`${z.label} → ${z.value.toFixed(1)} µg/m³`}
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: gradients[i % gradients.length],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: size / 5,
                  boxShadow:
                    "0px 10px 25px rgba(0,0,0,0.2), inset 0px -5px 10px rgba(0,0,0,0.2)",
                  transition: "all 0.4s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {z.label}-{Math.round(z.value)}
              </div>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default Temp;