'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  IconButton,
  Button,
  Link,
  Drawer,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { AutoAwesome, Menu as MenuIcon, Close } from '@mui/icons-material';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box
      component={motion.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
      }}
    >
      <Box sx={{ mx: 2, mt: 2 }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(96, 63, 239, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              px: { xs: 2, sm: 3 },
              py: 1,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: 'rgba(96, 63, 239, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesome sx={{ fontSize: 20, color: '#603FEF' }} />
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                Nexus
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 4,
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  underline="none"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>

            {/* Desktop Buttons */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Button
                sx={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                sx={{
                  fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                  color: '#ffffff',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderRadius: 2,
                  boxShadow: '0 0 20px rgba(96, 63, 239, 0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4A2FBD 0%, #603FEF 100%)',
                    boxShadow: '0 0 30px rgba(96, 63, 239, 0.7)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#ffffff',
                p: 1,
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <Close /> : <MenuIcon />}
            </IconButton>
          </Toolbar>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                sx={{
                  display: { xs: 'block', md: 'none' },
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                  <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0 }}>
                    {navLinks.map((link) => (
                      <ListItem key={link.label} sx={{ p: 0 }}>
                        <Link
                          href={link.href}
                          underline="none"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            py: 1,
                            width: '100%',
                            transition: 'color 0.3s ease',
                            '&:hover': {
                              color: '#ffffff',
                            },
                          }}
                        >
                          {link.label}
                        </Link>
                      </ListItem>
                    ))}
                  </List>

                  <Divider
                    sx={{
                      my: 2,
                      borderColor: 'rgba(96, 63, 239, 0.2)',
                    }}
                  />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      fullWidth
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textTransform: 'none',
                        py: 1.5,
                        justifyContent: 'flex-start',
                        '&:hover': {
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        fontSize: '0.875rem',
                        background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                        color: '#ffffff',
                        py: 1.5,
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: '0 0 20px rgba(96, 63, 239, 0.5)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4A2FBD 0%, #603FEF 100%)',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </AnimatePresence>
        </AppBar>
      </Box>
    </Box>
  );
};

export default Navbar;