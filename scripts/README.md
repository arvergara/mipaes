# Question Generation System

This system generates PAES questions using subject content and real exam examples as reference.

## PDF Content Structure

Place your PDF files in the `content` directory with the following structure:

```
content/
  ├── M1_content.pdf    # Matemática 1 subject content
  ├── M1_examples.pdf   # Matemática 1 example questions
  ├── M2_content.pdf    # Matemática 2 subject content
  ├── M2_examples.pdf   # Matemática 2 example questions
  ├── L_content.pdf     # Lenguaje subject content
  ├── L_examples.pdf    # Lenguaje example questions
  ├── C_content.pdf     # Ciencias subject content
  └── C_examples.pdf    # Ciencias example questions
```

## Content PDFs
- `*_content.pdf`: Contains the complete subject curriculum and topics
- `*_examples.pdf`: Contains real PAES questions for reference

## Running the Generator

1. Place your PDF files in the content directory
2. Run: `npm run generate-questions`

The script will:
1. Read the PDF content
2. Generate questions based on the content
3. Save questions to the database