import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Slider } from 'react-native';
import { Audio } from 'expo-av';
import { theme } from '../theme';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioPlayer({ audioSource, title = 'Áudio relaxante', duration = 180 }) {
  const sound = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
        const { sound: s } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: false, volume, rate: speed },
          onPlaybackStatusUpdate
        );
        sound.current = s;
      } catch (error) {
        console.error('Erro ao carregar áudio:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAudio();
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [audioSource]);

  async function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      if (status.didJustFinish) {
        await fadeOut();
      }
    }
  }

  async function fadeOut() {
    if (!sound.current) return;
    await sound.current.setVolumeAsync(0.1);
    await sound.current.stopAsync();
    await sound.current.setVolumeAsync(volume);
    setIsPlaying(false);
    setPosition(0);
  }

  async function togglePlay() {
    if (!sound.current) return;
    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  }

  async function changeVolume(value) {
    setVolume(value);
    if (sound.current) {
      await sound.current.setVolumeAsync(value);
    }
  }

  async function changeSpeed(value) {
    setSpeed(value);
    if (sound.current) {
      await sound.current.setRateAsync(value, true);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
        <View style={styles.progressArea}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.surface}
            thumbTintColor={theme.colors.text}
            onSlidingComplete={async (value) => {
              if (sound.current) {
                await sound.current.setPositionAsync(value * 1000);
              }
            }}
          />
          <Text style={styles.timer}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
      </View>
      <View style={styles.options}>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Volume</Text>
          <Slider
            style={styles.smallSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.surface}
            thumbTintColor={theme.colors.text}
            onSlidingComplete={changeVolume}
          />
        </View>
        <View style={styles.speedRow}>
          {[0.75, 1, 1.25].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => changeSpeed(s)}
              style={[styles.speedButton, speed === s && styles.speedActive]}
            >
              <Text style={styles.speedText}>{s}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {loading ? <Text style={styles.loading}>Carregando áudio...</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
  },
  progressArea: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timer: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    textAlign: 'right',
  },
  options: {
    marginTop: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    width: 70,
    fontSize: theme.typography.body,
  },
  smallSlider: {
    flex: 1,
    height: 40,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  speedButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  speedActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  speedText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
  },
  loading: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.sm,
  },
});
