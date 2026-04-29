import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

function ShimmerBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function FeedSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <ShimmerBlock width={36} height={36} borderRadius={18} />
            <View style={{ flex: 1, gap: 6 }}>
              <ShimmerBlock width="60%" height={12} />
              <ShimmerBlock width="40%" height={10} />
            </View>
          </View>
          <ShimmerBlock width="100%" height={14} style={{ marginTop: 12 }} />
          <ShimmerBlock width="85%" height={14} style={{ marginTop: 6 }} />
          <ShimmerBlock width="100%" height={160} style={{ marginTop: 12 }} borderRadius={10} />
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            <ShimmerBlock width={50} height={20} />
            <ShimmerBlock width={50} height={20} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CirclesSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <ShimmerBlock width="100%" height={140} borderRadius={10} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
            <ShimmerBlock width={70} height={12} />
            <ShimmerBlock width={40} height={12} />
          </View>
          <ShimmerBlock width="70%" height={16} style={{ marginTop: 8 }} />
          <ShimmerBlock width="100%" height={12} style={{ marginTop: 6 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <ShimmerBlock width={70} height={30} borderRadius={16} />
            <ShimmerBlock width={70} height={30} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function EventsSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <ShimmerBlock width="100%" height={120} borderRadius={10} />
          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            <ShimmerBlock width={80} height={24} borderRadius={14} />
            <ShimmerBlock width={60} height={24} borderRadius={14} />
          </View>
          <ShimmerBlock width="75%" height={16} style={{ marginTop: 8 }} />
          <ShimmerBlock width="100%" height={12} style={{ marginTop: 6 }} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            <ShimmerBlock width={16} height={16} />
            <ShimmerBlock width={100} height={14} />
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <ShimmerBlock width="30%" height={36} borderRadius={10} />
            <ShimmerBlock width="30%" height={36} borderRadius={10} />
            <ShimmerBlock width="30%" height={36} borderRadius={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
