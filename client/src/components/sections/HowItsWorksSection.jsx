import { motion } from 'framer-motion';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import {
  Storage,
  Memory,
  ShowChart,
  Rocket,
} from '@mui/icons-material';

const steps = [
  {
    icon: Storage,
    step: '01',
    title: 'Connect Your Data',
    description: 'Seamlessly integrate with 100+ data sources including databases, APIs, and cloud services.',
  },
  {
    icon: Memory,
    step: '02',
    title: 'AI Processing',
    description: 'Our advanced AI analyzes your data, identifying patterns and generating actionable insights.',
  },
  {
    icon: ShowChart,
    step: '03',
    title: 'Visualize Insights',
    description: 'Beautiful dashboards and reports that make complex data easy to understand.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Take Action',
    description: 'Make informed decisions faster with predictive analytics and automated recommendations.',
  },
];

const HowItWorksSection = () => {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        py: { xs: 12, md: 16 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 6 } }}>
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
            How It{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Works
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
            Get started in minutes with our simple four-step process.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {/* Connecting Line - Desktop Only */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'block' },
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(96, 63, 239, 0.3), transparent)',
              transform: 'translateY(-50%)',
            }}
          />

          <Grid container spacing={4}>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    sx={{ position: 'relative', height: '100%' }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        backgroundColor: 'rgba(10, 10, 10, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(96, 63, 239, 0.2)',
                        borderRadius: 2,
                        position: 'relative',
                        zIndex: 10,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(10, 10, 10, 0.8)',
                          borderColor: 'rgba(96, 63, 239, 0.5)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(96, 63, 239, 0.2)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 3,
                          }}
                        >
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 1.5,
                              backgroundColor: 'rgba(96, 63, 239, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconComponent sx={{ fontSize: 28, color: '#603FEF' }} />
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '2.5rem',
                              fontWeight: 700,
                              color: 'rgba(96, 63, 239, 0.2)',
                            }}
                          >
                            {step.step}
                          </Typography>
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            mb: 1.5,
                            color: '#ffffff',
                          }}
                        >
                          {step.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: 1.6,
                          }}
                        >
                          {step.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;