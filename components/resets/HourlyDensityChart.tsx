import { ResetHistoryEntry } from '@/types';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, Rect, Stop, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HourlyDensityChartProps {
  resets: ResetHistoryEntry[];
}

export function HourlyDensityChart({ resets }: HourlyDensityChartProps) {
 
  const hourlyCounts = Array.from({ length: 24 }, (_, i) => {
    return resets.filter((r) => new Date(r.date).getHours() === i).length;
  });

  const maxHourlyCount = Math.max(...hourlyCounts, 1);
  const peakHourIndex = hourlyCounts.indexOf(maxHourlyCount);
  const peakHour = `${peakHourIndex.toString().padStart(2, '0')}:00`;


  const graphHeight = 160;
  const graphWidth = Math.min(SCREEN_WIDTH - 80, 600); 
  const minBarWidth = 8;
  const maxBarWidth = 20;
  const barSpacing = 2;
  const barWidth = Math.min(Math.max(graphWidth / 24 - barSpacing, minBarWidth), maxBarWidth);

  
  const labelInterval = SCREEN_WIDTH < 400 ? 6 : SCREEN_WIDTH < 600 ? 4 : 3;
  const fontSize = SCREEN_WIDTH < 400 ? 9 : SCREEN_WIDTH < 600 ? 10 : 11;

  
  const getIntensityColor = (count: number) => {
    const intensity = count / maxHourlyCount;
    if (intensity === 0) return '#1e293b';
    if (intensity <= 0.25) return '#1e40af';
    if (intensity <= 0.5) return '#3b82f6';
    if (intensity <= 0.75) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Densidade Horária</Text>
      <View style={styles.densityHeader}>
        <Text style={styles.subtitle}>
          Pico às {peakHour} • {maxHourlyCount} reset{maxHourlyCount !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.densityLegend}>
          Intensidade: <Text style={{ color: '#1e40af' }}>●</Text> Baixa{' '}
          <Text style={{ color: '#3b82f6' }}>●</Text> Média{' '}
          <Text style={{ color: '#f59e0b' }}>●</Text> Alta{' '}
          <Text style={{ color: '#ef4444' }}>●</Text> Crítica
        </Text>
      </View>

      <View style={styles.lineChartContainer}>
        <Svg height={graphHeight + 80} width={graphWidth + 40}>
          <Defs>
            <SvgLinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#3b82f6" stopOpacity="0.8" />
              <Stop offset="1" stopColor="#1e40af" stopOpacity="0.4" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <Line
              key={`grid-${i}`}
              x1="30"
              y1={graphHeight - ratio * graphHeight + 10}
              x2={graphWidth + 30}
              y2={graphHeight - ratio * graphHeight + 10}
              stroke={i === 0 ? '#475569' : '#334155'}
              strokeWidth={i === 0 ? '2' : '0.5'}
              strokeDasharray={i === 0 ? '0' : '3,3'}
            />
          ))}

          {/* Eixo Y */}
          <Line
            x1="30"
            y1="10"
            x2="30"
            y2={graphHeight + 10}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Barras horárias */}
          {hourlyCounts.map((count, i) => {
            const barHeight = maxHourlyCount > 0 ? (count / maxHourlyCount) * graphHeight : 0;
            const x = 35 + i * (barWidth + barSpacing);
            const color = getIntensityColor(count);

            return (
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={graphHeight - barHeight + 10}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill={count > 0 ? color : '#1e293b'}
                  rx={2}
                  stroke={count > 0 ? '#ffffff20' : 'transparent'}
                  strokeWidth="0.5"
                />
                {count > 0 && (
                  <Circle
                    cx={x + barWidth / 2}
                    cy={graphHeight - barHeight + 5}
                    r="2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Labels de hora */}
          {Array.from({ length: 24 }, (_, i) => {
            const shouldShow = i % labelInterval === 0 || hourlyCounts[i] >= maxHourlyCount * 0.75;
            if (!shouldShow) return null;

            return (
              <SvgText
                key={`label-${i}`}
                x={35 + i * (barWidth + barSpacing) + barWidth / 2}
                y={graphHeight + 30}
                fontSize={fontSize}
                fill={hourlyCounts[i] > 0 ? '#ffffff' : '#94a3b8'}
                textAnchor="middle"
                fontWeight={hourlyCounts[i] > 0 ? 'bold' : 'normal'}
                transform={`rotate(-45, ${35 + i * (barWidth + barSpacing) + barWidth / 2}, ${graphHeight + 30})`}
              >
                {i.toString().padStart(2, '0')}h
              </SvgText>
            );
          })}

          {/* Labels do eixo Y */}
          {[0, Math.ceil(maxHourlyCount * 0.5), maxHourlyCount].map((value, i) => (
            <SvgText
              key={`y-label-${i}`}
              x="25"
              y={graphHeight - (value / maxHourlyCount) * graphHeight + 14}
              fontSize={fontSize}
              fill="#94a3b8"
              textAnchor="end"
              fontWeight="600"
            >
              {value}
            </SvgText>
          ))}

          {/* Título do eixo Y */}
          <SvgText
            x="10"
            y={graphHeight / 2 + 10}
            fontSize={fontSize}
            fill="#94a3b8"
            textAnchor="middle"
            transform={`rotate(-90, 10, ${graphHeight / 2 + 10})`}
          >
            Resets
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
  },
  densityHeader: {
    marginBottom: 16,
    gap: 8,
  },
  densityLegend: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Inter-Regular',
  },
  lineChartContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
});