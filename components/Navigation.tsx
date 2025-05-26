import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MessageSquare, User, BookOpen } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: typeof MessageSquare; label: string }) => (
    <Link href={to} asChild>
      <Pressable style={[styles.navItem, isActive(to) && styles.activeNavItem]}>
        <Icon size={24} color={isActive(to) ? '#8B5CF6' : '#9CA3AF'} />
        <Text style={[styles.navText, isActive(to) && styles.activeNavText]}>{label}</Text>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <NavLink to="/" icon={MessageSquare} label="Chat" />
        <NavLink to="/bible" icon={BookOpen} label="Bible" />
        <NavLink to="/profile" icon={User} label="Profile" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 32,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#F3F4F6',
  },
  navText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#9CA3AF',
  },
  activeNavText: {
    color: '#8B5CF6',
  },
});