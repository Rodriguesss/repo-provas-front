import {
  Box,
  Button,
  Divider,
  TextField,
  Autocomplete,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import api, { Category, Discipline, Teacher, CreateTestData } from "../services/api";

interface FormDataRelationals {
  category: string;
  discipline: string;
  teacher: string;
}

function TestPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setMessage } = useAlert();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [disciplineId, setDisciplineId] = useState<Number>(0);
  const [isDisabled, setIsDisabled] = useState(true);
  const [formDataRelationals, setFormDataRelationals] = useState<FormDataRelationals>({
    category: '',
    discipline: '',
    teacher: ''
  });
  const [formData, setFormData] = useState<CreateTestData>({
    name: "",
    pdfUrl: "",
    categoryId: 0,
    disciplineId: 0,
    teacherId: 0
  });

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);

      const { data: disciplinesData } = await api.getDisciplines(token);
      setDisciplines(disciplinesData.disciplines);
    }
    loadPage();
  }, [token]);

  useEffect(() => {
    async function loadTeachers() {
      if (!token) return;

      const { data: teachersData } = await api.getTeachers(token, disciplineId.toString());
      setTeachers(teachersData.teachers);
    }

    if (!isDisabled) loadTeachers();
  }, [token, disciplineId, isDisabled]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData?.name || !formData?.pdfUrl || !formData?.categoryId || !formData?.disciplineId || !formData?.teacherId) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }

    try {
      const { status } = await api.createTest(formData, token);

      if (status === 200) {
        setMessage({ type: "success", text: "Prova cadastrada com sucesso." });
        setFormData({
          name: "",
          pdfUrl: "",
          categoryId: 0,
          disciplineId: 0,
          teacherId: 0
        });
        setFormDataRelationals({
          category: '',
          discipline: '',
          teacher: ''
        });
        return;
      }
    } catch (error: any) {
      const { data: text } = error.response;

      setMessage({ type: "error", text });
      return;
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const styles = {
    display: 'flex', 
    justifyContent: 'center', 
    marginBottom: '30px',
  }

  return (
    <>
      <Typography variant="h5" component="h1" sx={styles}>
        Adicione uma prova
      </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar-prova")}>
            Adicionar
          </Button>
        </Box>
        <FormCreateTest
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          disciplines={disciplines}
          teachers={teachers}
          setDisciplineId={setDisciplineId}
          isDisabled={isDisabled}
          setIsDisabled={setIsDisabled}
          formDataRelationals={formDataRelationals}
          setFormDataRelationals={setFormDataRelationals}
        />
      </Box>
    </>
  );
}

function FormCreateTest({
  handleSubmit,
  handleInputChange,
  formData,
  setFormData,
  categories,
  disciplines,
  teachers,
  setDisciplineId,
  isDisabled,
  setIsDisabled,
  formDataRelationals,
  setFormDataRelationals
}: any) {
  const styles = {
    input: { marginBottom: "16px", width: "50vw" },
  };

  return (
    <Box sx={{ marginTop: "50px" }}>
      <Form onSubmit={handleSubmit}>
        <TextField
          name="name"
          sx={styles.input}
          label="Título da prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.name}
        />
        <TextField
          name="pdfUrl"
          sx={styles.input}
          label="PDF da prova"
          type="url"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.pdfUrl}
        />
        <Autocomplete
          getOptionLabel={(categories: Category): string => `${categories.name}`}
          options={categories}
          sx={styles.input}
          inputValue={formDataRelationals.category}
          noOptionsText={"Não existem categorias cadastradas"}
          renderOption={(props, categories) => (
            <Box component="li" {...props} key={categories.id}>
              {categories.name}
            </Box>
          )}
          onChange={(event: any, option: Category | null) => {
            const categoryId = option?.id;
            setFormData({ ...formData, categoryId });
            setFormDataRelationals({
              ...formDataRelationals,
              category: option?.name
            })
          }}
          renderInput={(params) => <TextField {...params} label="Categorias" />}
        />
        <Autocomplete
          getOptionLabel={(disciplines: Discipline): string => `${disciplines.name}`}
          options={disciplines}
          sx={styles.input}
          inputValue={formDataRelationals.discipline}
          noOptionsText={"Não existem disciplinas cadastradas"}
          renderOption={(props, disciplines) => (
            <Box component="li" {...props} key={disciplines.id}>
              {disciplines.name}
            </Box>
          )}
          onChange={(event: any, option: Discipline | null) => {
            const disciplineId = option?.id;
            setFormData({ ...formData, disciplineId });
            setDisciplineId(disciplineId);
            setIsDisabled(false);
            setFormDataRelationals({
              ...formDataRelationals,
              teacher: '',
              discipline: option?.name
            })
            console.log(disciplineId);
          }}
          renderInput={(params) => <TextField {...params} label="Disciplina" />}
        />
        <Autocomplete
          disabled={isDisabled}
          getOptionLabel={(teachers: Teacher): string => `${teachers.name}`}
          options={teachers}
          sx={styles.input}
          inputValue={formDataRelationals.teacher}
          noOptionsText={"Não existem pessoas instrutoras cadastradas"}
          renderOption={(props, teachers) => (
            <Box component="li" {...props} key={teachers.id}>
              {teachers.name}
            </Box>
          )}
          onChange={(event: any, option: Teacher | null) => {
            const teacherId = option?.id;
            setFormData({ ...formData, teacherId });
            setFormDataRelationals({
              ...formDataRelationals,
              teacher: option?.name
            });
          }}
          renderInput={(params) => <TextField {...params} label="Pessoa Instrutora" />}
        />
        <Button variant="contained" type="submit" sx={styles.input}>
          Enviar
        </Button>

      </Form>
    </Box>
  );
}

export default TestPage;
