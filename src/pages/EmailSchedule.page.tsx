import { useState } from "react";
// import { Formik, Form, Field } from "formik";
// import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import * as Yup from "yup";
import {useForm, yupResolver} from "@mantine/form"
import { Button, Center, Checkbox, Container, Group, Paper, Text, Textarea, TextInput, Title } from "@mantine/core";
import { theme } from "@/theme";
// import React from "react";


export default function EmailScheduler () {
  const validationSchema = Yup.object({
      to: Yup.string().email("Email invalide").required("Email requis"),
      subject: Yup.string().required("Sujet requis"),
      text: Yup.string().required("Message requis"),
      minute: Yup.string()
        .matches(/^(?:[0-5]?\d)$/, "Minute invalide (0-59 uniquement)")
        .required("Minute requise"),
      
      hour: Yup.string()
        .matches(/^(?:[0-1]?\d|2[0-3])$/, "Heure invalide (0-23 uniquement)")
        .required("Heure requise"),
      // day: Yup.string().required("Jour requis"),
      // month: Yup.string().required("Mois requis"),
      daysOfWeek: Yup.array().min(1, "Sélectionnez au moins un jour"),
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
    const initialValues = {
      to: "",
      subject: "",
      text: "",
      minute: "",
      hour: "",
      day: "*",
      month: "*",
      daysOfWeek: [] as string[],
      scheduleRule: {},
    };
  
    const scheduleForm = useForm({
      initialValues: initialValues,
      validate: yupResolver(validationSchema),
    });

    // Handle checkbox selection
    const handleDayChange = (day: string, checked: boolean) => {
      setSelectedDays((prev) => {
        const updatedDays = checked
          ? [...prev, day] // Add selected day
          : prev.filter((d) => d !== day); // Remove unselected day
    
        // Now update the form value *after* the state update
        scheduleForm.setFieldValue("daysOfWeek", updatedDays);
    
        return updatedDays; // Ensure state updates correctly
      });
      // setSelectedDays((prev) =>
      //   checked ? [...prev, day] : prev.filter((d) => d !== day)
      // );
      // scheduleForm.setFieldValue("daysOfWeek", selectedDays)
    };

    const getCronExpression = () => {
      const { minute, hour, day, month } = scheduleForm.values;
      const daysOfWeek = selectedDays.length > 0 ? selectedDays.join(",") : "*";
      return `${minute} ${hour} ${day} ${month} ${daysOfWeek}`;
    };
  
    const handleSubmit = async () => {
      setIsSubmitting(true);
      const { minute, hour } = scheduleForm.values;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      try {
        const response = await axios.post("https://email-scheduler-api-production.up.railway.app/schedule-email", {
          to: scheduleForm.values.to,
          subject: scheduleForm.values.subject,
          text: scheduleForm.values.text,
          scheduleRule: {
            minute,
            hour,
            dayOfWeek: selectedDays.length > 0 ? selectedDays.join(",") : "*",
            tz: timeZone
          },
        });
  
        alert(`✅ ${response.data.message}`);
        setSelectedDays([]);
        scheduleForm.reset();
      } catch (error) {
        console.error("Erreur d'envoi :", error);
        alert("❌ Erreur lors de la planification de l'email");
      }
      setIsSubmitting(false);
    }
    
    return (
        <Center>
          <Paper w={900} bg="white" radius="xs" px="xl" py={50} mt="xl" shadow="lg">
            <Title variant="h5" ta="center">
              Planifier un e-mail
            </Title>
            <form 
                onSubmit={scheduleForm.onSubmit(handleSubmit)
                }
            >
                <TextInput
                    label="Email du destinataire"
                    placeholder="account@company.com"
                    withAsterisk
                    {...scheduleForm.getInputProps("to")}
                    mt="md"
                />
                
                <TextInput
                    label="Object"
                    placeholder="Service d'envoi automatique de mail"
                    withAsterisk
                //   required
                    {...scheduleForm.getInputProps("subject")}
                    mt="md"
                />
                
                <Textarea
                    label="Message"
                    withAsterisk
                    rows={4}
                    {...scheduleForm.getInputProps("text")}
                    mt="md"
                />

                {/* Scheduling Fields */}
                <Group mt="md" grow>
                    <TextInput placeholder="*" label="Minute (0-59, * = toutes)" {...scheduleForm.getInputProps("minute")} />
                    <TextInput placeholder="*" label="Heure (0-23, * = toutes)" {...scheduleForm.getInputProps("hour")} />
                </Group>

                {/* Days of the Week */}
                <Title order={6} fw="normal" mt="md">Jours de la semaine</Title>
                <Group mt="xs">
                  {["0", "1", "2", "3", "4", "5", "6"].map((day, index) => (
                    <Checkbox
                      key={day}
                      label={["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][index]}
                      checked={selectedDays.includes(day)}
                      onChange={(event) => handleDayChange(day, event.currentTarget.checked)}
                    />
                  ))}
                </Group>
                {/* Error Message for Days of the Week */}
                {scheduleForm.errors.daysOfWeek && (
                  <Text c="red" size="xs" mt="xs">
                    {scheduleForm.errors.daysOfWeek}
                  </Text>
                )}
                <Group mt="lg" justify="flex-end">
                    <Button type="submit" variant="filled" color="blue" loading={isSubmitting}>
                        {isSubmitting ? "Envoi..." : "Planifier l'e-mail"}
                    </Button>
                </Group>
            </form>
          </Paper>
        </Center>
      );
}