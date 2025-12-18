import { motion } from 'framer-motion';
import { Box, Container, Typography, Grid, Link, IconButton, Divider } from '@mui/material';
import { AutoAwesome, GitHub, Twitter, LinkedIn } from '@mui/icons-material';

const footerLinks = {
  product: [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Integrations', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
  ],
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        borderTop: '1px solid rgba(96, 63, 239, 0.2)',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 6 }, py: 8 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  Nexus
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                maxWidth: '320px',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              Transforming data into actionable intelligence for smarter business decisions.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                href="#"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 63, 239, 0.2)',
                    color: '#ffffff',
                  },
                }}
              >
                <Twitter sx={{ fontSize: 16 }} />
              </IconButton>

              <IconButton
                href="#"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 63, 239, 0.2)',
                    color: '#ffffff',
                  },
                }}
              >
                <GitHub sx={{ fontSize: 16 }} />
              </IconButton>

              <IconButton
                href="#"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(96, 63, 239, 0.2)',
                    color: '#ffffff',
                  },
                }}
              >
                <LinkedIn sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Grid>

          {/* Product Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
              }}
            >
              Product
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.product.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
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
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
              }}
            >
              Company
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.company.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
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
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Resources Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
              }}
            >
              Resources
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.resources.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
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
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
              }}
            >
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {footerLinks.legal.map((link) => (
                <Box component="li" key={link.label} sx={{ mb: 1.5 }}>
                  <Link
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
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(96, 63, 239, 0.2)', mb: 4 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            © 2024 Nexus Analytics. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Built with precision for data-driven teams.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;