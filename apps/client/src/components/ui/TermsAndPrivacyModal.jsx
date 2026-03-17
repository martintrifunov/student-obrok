import React, { useState, useEffect } from "react";
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

const TermsAndPrivacyModal = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("obrok_terms_accepted");
    if (!hasAccepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("obrok_terms_accepted", "true");
    setOpen(false);
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
          Ве молиме прочитајте ги и прифатете ги условите за да продолжите со
          користење на апликацијата.
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
            <strong>1. Информативен карактер:</strong> Податоците, цените и
            достапноста на производите прикажани во оваа апликација се од
            исклучиво информативен карактер. Тие се преземени од јавно достапни
            извори (маркети) и може да подлежат на промени без претходна најава.
            Студент Оброк не гарантира за нивната 100% точност во секое време.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>2. Ограничување на одговорност:</strong> Апликацијата и
            нејзиниот креатор не носат никаква правна или материјална
            одговорност за евентуални грешки во цените, недостапност на залихи
            во физичките маркети, или било какви одлуки донесени врз база на
            информациите прикажани овде.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>3. Правилно користење:</strong> Се согласувате да ја
            користите апликацијата согласно законите и да не користите
            автоматизирани скрипти за преоптоварување на нашата инфраструктура
            без дозвола.
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
            <strong>1. Податоци за локација (GPS):</strong> За да ви ги
            прикажеме најблиските маркети и рутите до нив, апликацијата може да
            побара пристап до вашата моментална локација. Овие податоци се
            обработуваат исклучиво <strong>локално на вашиот уред</strong> и
            НИКОГАШ не се испраќаат, зачувуваат или споделуваат со нашите
            сервери или трети страни.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>2. Колачиња (Cookies) и Local Storage:</strong> Ние
            користиме технологии како Local Storage исклучиво за функционални
            потреби на апликацијата (како на пример, зачувување на изборот за
            темна/светла тема и памтење дека сте ги прифатиле овие услови), со
            цел да ви овозможиме подобро корисничко искуство.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>3. Аналитика:</strong> Може да собираме анонимизирани
            податоци за посетеноста исклучиво со цел подобрување на стабилноста
            на апликацијата. Не собираме податоци кои можат лично да ве
            идентификуваат (PII).
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
