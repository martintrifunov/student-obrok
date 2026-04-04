import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";

const TermsAndPrivacyModal = ({ open, onAccept }) => {
  const theme = useTheme();

  const handleAccept = () => {
    if (onAccept) onAccept();
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "85vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          backgroundColor:
            theme.palette.mode === "dark" ? "grey.900" : "grey.100",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Услови за користење & Политика за приватност
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={1}
        >
          Ве молиме одвојте момент да ги прочитате условите пред да
          продолжите со користење на апликацијата.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, pt: 3 }}>
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <GavelIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Услови за користење (Terms of Service)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>1. Информативна платформа:</strong> Цените и достапноста се
            преземени од јавни извори и може да се променат во секое време.
            Можно е да има разлика меѓу прикажаната и реалната состојба во
            маркет.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>2. Одговорност:</strong> Ве молиме потврдете ги информациите
            директно во маркет пред купување. Апликацијата е наменета за брза
            споредба и ориентација, а не како единствен извор за конечна
            одлука.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>3. Користење:</strong> Со продолжување се согласувате на
            коректно и законско користење на апликацијата и на нејзините
            функционалности.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Политика за приватност (Privacy Policy)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>1. Локација:</strong> Ако дозволите пристап до локација,
            ја користиме за функции како прикажување на блиски маркети и рути,
            со цел полесно снаоѓање во апликацијата.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>2. Основни податоци за работа:</strong> Користиме технички
            податоци за да ја одржуваме апликацијата стабилна, безбедна и
            подобра за користење. Овие податоци ги користиме за дијагностика,
            подобрување на перформанси и подобро корисничко искуство.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>3. Приватност:</strong> Не продаваме лични податоци и не ги
            користиме за рекламирање од трети страни. Пристап до системските
            информации има само овластен тим за одржување. Не собираме и не
            чуваме лично препознатливи информации (PII).
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? "grey.900" : "grey.100",
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleAccept}
          sx={{
            px: 8,
            py: 1.5,
            fontWeight: "bold",
            fontSize: "1.1rem",
            borderRadius: 2,
          }}
        >
          Се согласувам (I Agree)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndPrivacyModal;
