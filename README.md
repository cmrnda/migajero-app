# MigajeroApp 💜 (AWS Cloud Club UMSA)

**MigajeroTest** es una app web tipo *quiz* (en modo broma) que calcula tu **porcentaje de “migajer@”** y te devuelve un **resultado narrado**.  
Proyecto creado como demo **100% AWS serverless** para el **AWS Cloud Club** (full cloud vibes, cero backend tradicional).

> ⚠️ **Disclaimer:** Esto es solo entretenimiento. No es un diagnóstico psicológico ni reemplaza consejo profesional.

---

## 🧠 ¿Qué hace la app?

- Muestra un **formulario de 10–15 preguntas** con opciones.
- Calcula un **score 0–100%** + “tags” (ej. *breadcrumbing*, *esperanza premium*, *límites*).
- Genera un **comentario final** usando **Amazon Bedrock** (solo al final, para optimizar costos).
- Guarda resultados para **compartir sin rehacer** el test (con login).
- Modos:
  - 🧍 **Solitario**
  - ⚔️ **1 vs 1**
  - 👥 **Grupos (máx 5)**

---

## 🏗️ Arquitectura (AWS Serverless)

### Frontend
- **Angular (Standalone + Signals)**
- **Tailwind CSS**
- UI en español, **variables/código en inglés**
- Accent color: **#7c5aed** (botones, bordes, highlights)

### Hosting
- **AWS Amplify Hosting** (CI/CD + CloudFront + S3)

### Auth
- **Amazon Cognito** (signup/login/confirmación/recuperar contraseña)

### Backend
- **Amazon API Gateway** (REST)
- **AWS Lambda** (Node.js)
- **Amazon DynamoDB** (single-table design con PK/SK)

### IA (solo comentario final)
- **Amazon Bedrock** (generación del texto final del resultado)

### Observabilidad
- **Amazon CloudWatch** (logs y métricas)

---

## 🧩 Stack Tecnológico

- Angular (Standalone components + Signals)
- Tailwind CSS
- AWS Amplify (Gen 1)
- Amazon Cognito
- API Gateway + Lambda (Node.js)
- DynamoDB
- Amazon Bedrock
- CloudWatch

---

## 📦 Requisitos

- Node.js + npm
- Angular CLI
- AWS Amplify CLI
- AWS Profile configurado

---

## 🚀 Ejecutar en local

### 1) Instalar dependencias
```bash
npm install
