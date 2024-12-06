/**
 * SectionForm Component
 * 
 * Features:
 * - Dynamic form generation based on section questions
 * - Handles all question types (text, radio, checkbox, etc.)
 * - Form validation based on question configuration
 * - Real-time validation and error handling
 */

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useFormData } from './hooks/useFormData';
import { useFormRendering } from './hooks/useFormRendering';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button
} from '@mui/material';

const SectionForm = ({ section, profileType, formData: initialFormData }) => {
  const theme = useTheme();
  const {
    formData,
    errors,
    loading,
    enhancingFields,
    handleInputChange,
    handleMultiSelectChange,
    handleGroupFieldChange,
    handleAddGroup,
    handleRemoveGroup,
    handleSubmit,
    handleFileChange,
    filePreviews,
    handleRewrite,
    setErrors
  } = useFormData(section, profileType, initialFormData);

  const { renderQuestion } = useFormRendering(
    section,
    formData,
    errors,
    loading,
    handleInputChange,
    handleMultiSelectChange,
    handleGroupFieldChange,
    handleAddGroup,
    handleRemoveGroup,
    handleRewrite,
    handleFileChange,
    filePreviews,
    enhancingFields
  );

  if (!section || !section.questions) {
    return null;
  }

  return (
    <Paper elevation={0}>
      <Box p={2} pt={0.5}>
        {section.description && (
          <Box mb={2} pb={1} borderBottom={1} borderColor="divider">
            <Typography variant="h6" gutterBottom>
              {section.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {section.description}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {section.questions?.map((question, index) => {
              if (!question) return null;

              // Check if this is the first name field and the next one is last name
              if ((question.id === 'firstName' && section.questions[index + 1]?.id === 'lastName') ||
                  (question.id === 'email' && section.questions[index + 1]?.id === 'phoneNumber')) {
                const nextQuestion = section.questions[index + 1];
                // Only render side by side if both questions exist
                if (nextQuestion) {
                  return (
                    <Box
                      key={question.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2
                      }}
                    >
                      <Box>{renderQuestion(question)}</Box>
                      <Box>{renderQuestion(nextQuestion)}</Box>
                    </Box>
                  );
                }
              }
              // Skip the second field since we already rendered it
              if ((question.id === 'lastName' && section.questions[index - 1]?.id === 'firstName') ||
                  (question.id === 'phoneNumber' && section.questions[index - 1]?.id === 'email')) {
                return null;
              }
              // Render other fields normally
              return (
                <Box key={question.id}>
                  {renderQuestion(question)}
                </Box>
              );
            })}
          </Stack>
        )}

        {errors.submit && (
          <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block' }}>
            {errors.submit}
          </Typography>
        )}

        <Box mt={4} pt={2} borderTop={1} borderColor="divider" textAlign="right">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SectionForm; 