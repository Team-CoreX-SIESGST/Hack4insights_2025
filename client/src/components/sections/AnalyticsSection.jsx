import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import {
  TrendingUp,
  People,
  AttachMoney,
  ShowChart,
} from '@mui/icons-material';

const stats = [
  {
    icon: TrendingUp,
    value: 98.5,
    suffix: '%',
    label: 'Conversion Rate',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    icon: AttachMoney,
    value: 2.4,
    suffix: 'M',
    prefix: '$',
    label: 'Revenue Growth',
    trend: '+28.3%',
    trendUp: true,
  },
  {
    icon: People,
    value: 847,
    suffix: 'K',
    label: 'Active Users',
    trend: '+18.2%',
    trendUp: true,
  },
  {
    icon: ShowChart,
    value: 99.9,
    suffix: '%',
    label: 'Uptime',
    trend: 'Enterprise SLA',
    trendUp: true,
  },
];

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (value < 10) return latest.toFixed(1);
    return Math.round(latest).toString();
  });

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: 'easeOut' });
    return animation.stop;
  }, [value, count]);

  return (
    <Typography
      component="span"
      sx={{
        fontSize: { xs: '2.5rem', md: '3rem' },
        fontWeight: 700,
        color: '#ffffff',
        display: 'block',
      }}
    >
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </Typography>
  );
};

const AnalyticsSection = () => {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 12, md: 16 },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(96, 63, 239, 0.05), transparent)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, px: { xs: 3, sm: 6 } }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              mb: 2,
              color: '#ffffff',
            }}
          >
            Trusted by{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Industry Leaders
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Join thousands of companies using our platform to drive growth and make data-driven decisions.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    backgroundColor: 'rgba(10, 10, 10, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 63, 239, 0.2)',
                    borderRadius: 2,
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      borderColor: 'rgba(96, 63, 239, 0.5)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(96, 63, 239, 0.2)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(96, 63, 239, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 24, color: '#603FEF' }} />
                    </Box>

                    <AnimatedNumber
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        mt: 1,
                        mb: 2,
                      }}
                    >
                      {stat.label}
                    </Typography>

                    <Chip
                      icon={<TrendingUp sx={{ fontSize: 14 }} />}
                      label={stat.trend}
                      size="small"
                      sx={{
                        backgroundColor: stat.trendUp
                          ? 'rgba(74, 222, 128, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                        color: stat.trendUp ? '#4ade80' : '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        px: 1.5,
                        py: 0.5,
                        '& .MuiChip-icon': {
                          color: stat.trendUp ? '#4ade80' : '#ef4444',
                          fontSize: 14,
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default AnalyticsSection;