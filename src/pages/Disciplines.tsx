import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IoEye } from "react-icons/io5";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token, refresh]);

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por disciplina"
      />
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
            variant="contained"
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
          <Button variant="outlined" onClick={() => navigate("/app/adicionar-prova")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} api={api} refresh={refresh} setRefresh={setRefresh} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
  api: any;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

function TermsAccordions({ categories, terms, api, refresh, setRefresh }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
              api={api}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
  api: any;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

function DisciplinesAccordions({
  categories,
  disciplines,
  api,
  refresh,
  setRefresh
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse período...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
              api={api}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
  api: any;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

function Categories({ categories, teachersDisciplines, api, refresh, setRefresh }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
              api={api}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
  api: any;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
  api,
  refresh,
  setRefresh
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests
      categoryId={categoryId}
      testsWithTeachers={testsWithDisciplines}
      api={api} 
      refresh={refresh}
      setRefresh={setRefresh} />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
  api: any;
  refresh: boolean;
  setRefresh: (value: boolean) => void;
}

function Tests({
  categoryId,
  testsWithTeachers: testsWithDisciplines,
  api,
  refresh,
  setRefresh
}: TestsProps) {

  async function handleAddView(id: number) {
    await api.addView(id);
    setRefresh(!refresh);
  }

  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => (
            <>
              <Typography key={test.id} color="#878787" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Link
                  href={test.pdfUrl}
                  target="_blank"
                  underline="none"
                  color="inherit"
                  onClick={() => handleAddView(test.id)}
                >{`${test.name} (${testsWithDisciplines.teacherName})`}</Link>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{test.views}<IoEye></IoEye></Box>
              </Typography>
            </>

          ))
      )}
    </>
  );
}

export default Disciplines;