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
            користиме Local Storage за функционални потреби (зачувување на
            изборот за темна/светла тема и памтење дека сте ги прифатиле овие
            услови). Покрај тоа, нашиот сервер поставува колаче{" "}
            <strong>obrok_vid</strong> — анонимен, траен идентификатор за
            посетители (важност: 1 година). Ова колаче е{" "}
            <strong>httpOnly</strong> (не е достапно преку JavaScript) и{" "}
            <strong>не содржи лични податоци</strong>. Се користи исклучиво за
            следење на бројот на уникатни посети со цел подобрување на
            апликацијата.{" "}
            <em>
              (In addition to Local Storage, our server sets an{" "}
              <strong>obrok_vid</strong> httpOnly analytics cookie — a random
              anonymous visitor identifier, valid for 1 year — used solely to
              count unique visits.)
            </em>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>3. Аналитика:</strong> Собираме технички податоци за
            употребата на апликацијата со цел подобрување на нејзината
            стабилност и перформанси. Конкретно:{" "}
            <strong>
              (а) прегледи на страници и навигациски настани; (б) сигнали за
              активност на секои 60 секунди додека апликацијата е отворена; (в)
              употреба на функциите за пребарување (паметно пребарување и
              хибридно пребарување).
            </strong>{" "}
            За секоја сесија на посетители, серверот привремено зачувува{" "}
            <strong>IP адреса</strong> и <strong>User-Agent</strong> ниска
            исклучиво за безбедносни цели и проверка на исправноста на
            системот. Суровите настани се бришат по <strong>90 дена</strong>;
            месечни агрегирани статистики (само бројки, без лична идентификација)
            се чуваат подолгорочно. Пристап до детални извештаи имаат само
            администраторите.{" "}
            <em>
              (We collect page views, 60 s activity heartbeats, and
              smart/hybrid-search usage events. Each visitor session temporarily
              stores an IP address and User-Agent string for security and
              reliability checks only. Raw events are deleted after 90 days;
              anonymous monthly aggregates are retained longer. Detailed reports
              are accessible only to administrators.)
            </em>
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
