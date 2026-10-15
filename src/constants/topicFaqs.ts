export interface TopicFaqItem {
  question: string;
  answer: string;
}

/**
 * Exact topic-wise FAQs extracted from public/Topic-Wise FAQs for Treatment Pages.pdf
 */
export const TOPIC_FAQS: Record<string, TopicFaqItem[]> = {
  // 1. Phobia
  "treatment-of-phobia": [
    {
      question: "What is a phobia?",
      answer: "A phobia is an intense and persistent fear of a specific object, situation, or activity. It can cause significant anxiety and may interfere with daily life."
    },
    {
      question: "What are the common types of phobias?",
      answer: "Common phobias include fear of heights, flying, enclosed spaces, spiders, needles, social situations, and public speaking. The type and severity of fear vary from person to person."
    },
    {
      question: "What are the symptoms of a phobia?",
      answer: "Symptoms may include intense fear, rapid heartbeat, sweating, trembling, dizziness, shortness of breath, and an urge to escape the feared situation."
    },
    {
      question: "What causes phobias?",
      answer: "Phobias may develop due to traumatic experiences, learned behaviours, family influences, or a combination of genetic and environmental factors. Sometimes, the exact cause is unclear."
    },
    {
      question: "Can phobias be treated?",
      answer: "Yes. Phobias are treatable. Psychological therapies, particularly cognitive behavioural therapy (CBT) and exposure therapy, can help reduce fear and avoidance."
    },
    {
      question: "What is the best treatment for phobias?",
      answer: "Treatment depends on the type and severity of the phobia. CBT and gradual, guided exposure therapy are commonly recommended. A qualified mental health professional can suggest an appropriate treatment plan."
    },
    {
      question: "Can phobias be treated without medication?",
      answer: "Yes. Many phobias can be managed effectively with psychological therapy without medication. The appropriate approach depends on individual symptoms and clinical assessment."
    },
    {
      question: "Can hypnosis help treat phobias?",
      answer: "Hypnosis may be considered as a complementary approach in selected cases, but evidence supporting it as a standalone treatment is limited. Established treatments such as CBT and exposure therapy remain important options."
    },
    {
      question: "How long does phobia treatment take?",
      answer: "Treatment duration varies according to the type of phobia, symptom severity, and individual response. Some people improve after a relatively short course of therapy, while others may require additional sessions."
    },
    {
      question: "Can phobias affect everyday life?",
      answer: "Yes. Phobias may affect personal relationships, education, work, travel, and routine activities. Professional support can help individuals manage their fears and improve daily functioning."
    },
    {
      question: "Can phobias return after treatment?",
      answer: "Phobia symptoms can sometimes return, particularly during stressful periods. Practising therapeutic techniques and attending follow-up sessions when needed can help maintain progress."
    },
    {
      question: "When should I consult a doctor for a phobia?",
      answer: "Consider professional help if your fear causes significant distress, leads you to avoid important activities, or interferes with your daily life. A qualified mental health professional can assess your symptoms and discuss suitable treatment options."
    },
    {
      question: "How can I book an appointment for phobia treatment at Kelkar Manas Health Care Clinic?",
      answer: "You can contact Kelkar Manas Health Care Clinic through the contact details provided on our website to enquire about consultations and available treatment options. Our team can guide you through the appointment process."
    }
  ],

  // 2. Panic Attacks
  "treatment-of-panic-attacks": [
    {
      question: "What is a panic attack?",
      answer: "A panic attack is a sudden episode of intense fear or discomfort that can occur even when there is no obvious danger. It may cause physical and emotional symptoms that can feel overwhelming."
    },
    {
      question: "What are the common symptoms of a panic attack?",
      answer: "Common symptoms include a racing heartbeat, sweating, trembling, shortness of breath, chest discomfort, dizziness, nausea, and a feeling of losing control. Some people may also fear that they are dying."
    },
    {
      question: "What causes panic attacks?",
      answer: "Panic attacks may be associated with stress, anxiety disorders, traumatic experiences, genetic factors, or certain medical conditions. Sometimes, they occur unexpectedly without a clear trigger."
    },
    {
      question: "Can panic attacks be treated?",
      answer: "Yes. Panic attacks are treatable. Psychological therapies, particularly cognitive behavioural therapy (CBT), can help people understand their symptoms, manage fear, and reduce the frequency and impact of attacks."
    },
    {
      question: "What is the best treatment for panic attacks?",
      answer: "Treatment depends on the individual's symptoms and medical history. CBT is a well-established treatment, and medication may be considered by a qualified doctor when appropriate."
    },
    {
      question: "How can I stop a panic attack when it happens?",
      answer: "Try to move to a safe, comfortable place and breathe gently and slowly without forcing deep breaths. Remind yourself that panic symptoms can pass, and focus on your immediate surroundings. If symptoms are new, severe, or unusual, seek medical assessment rather than assuming they are caused by anxiety."
    },
    {
      question: "Can panic attacks occur without any warning?",
      answer: "Yes. Panic attacks can occur unexpectedly, even during ordinary daily activities or while resting. Some people experience them in response to specific situations or triggers."
    },
    {
      question: "What is the difference between a panic attack and a panic disorder?",
      answer: "A panic attack is an episode of intense fear or discomfort. Panic disorder involves recurrent unexpected panic attacks along with persistent worry about further attacks or significant changes in behaviour because of them."
    },
    {
      question: "Can panic attacks be treated without medication?",
      answer: "Yes. Many people benefit from psychological treatment, particularly CBT, without medication. A qualified mental health professional can help determine the most suitable approach for each individual."
    },
    {
      question: "How long does a panic attack last?",
      answer: "A panic attack typically reaches its peak within minutes, and many attacks subside within about 20–30 minutes. However, lingering anxiety or tiredness may continue afterward."
    },
    {
      question: "Can stress and lack of sleep trigger panic attacks?",
      answer: "Stress and insufficient sleep may contribute to anxiety and can trigger or worsen panic symptoms in some people. Maintaining regular sleep habits and learning stress-management techniques may help."
    },
    {
      question: "When should I consult a doctor for panic attacks?",
      answer: "Seek professional help if panic attacks recur, cause persistent worry, or interfere with work, relationships, sleep, or daily activities. Chest pain, severe breathing difficulty, fainting, or new and unexplained symptoms require urgent medical assessment because they may have causes other than panic."
    },
    {
      question: "Can panic attacks happen during sleep?",
      answer: "Yes. Some people experience nocturnal panic attacks, which involve waking suddenly with intense fear and physical symptoms such as a racing heart, sweating, or breathlessness. Recurrent episodes should be evaluated by a healthcare professional."
    },
    {
      question: "Can panic attacks return after treatment?",
      answer: "Symptoms may recur during stressful periods, but many people learn effective ways to manage them through therapy and appropriate follow-up care."
    },
    {
      question: "How can I book a consultation for panic attack treatment at Kelkar Manas Health Care Clinic?",
      answer: "You can contact Kelkar Manas Health Care Clinic using the contact details provided on our website to enquire about mental health consultations and available treatment options. A qualified professional can assess your symptoms and guide you towards appropriate care."
    }
  ],

  // 3. OCD
  "treatment-of-ocd": [
    {
      question: "What is Obsessive-Compulsive Disorder (OCD)?",
      answer: "Obsessive-Compulsive Disorder (OCD) is a mental health condition involving recurring, unwanted thoughts, images, or urges (obsessions) and repetitive behaviours or mental acts (compulsions) that a person feels driven to perform to reduce anxiety or distress."
    },
    {
      question: "What are the common symptoms of OCD?",
      answer: "Common symptoms include repeated checking, excessive cleaning, unwanted intrusive thoughts, repeatedly arranging objects, counting, and a strong need for things to feel just right. Symptoms can vary from person to person."
    },
    {
      question: "What causes OCD?",
      answer: "The exact cause of OCD is not fully understood. It may involve a combination of genetic, biological, psychological, and environmental factors. OCD is not simply a result of poor discipline or a lack of willpower."
    },
    {
      question: "Can OCD be treated?",
      answer: "Yes. OCD is treatable, and many people experience significant improvement with appropriate care. Evidence-based treatments include cognitive behavioural therapy (CBT), particularly Exposure and Response Prevention (ERP), and medication when appropriate."
    },
    {
      question: "What is the best treatment for OCD?",
      answer: "ERP, a specialised form of CBT, is one of the most effective psychological treatments for OCD. It helps individuals gradually face anxiety-provoking thoughts or situations while learning to resist compulsive responses. A qualified professional can recommend an appropriate treatment plan."
    },
    {
      question: "Can OCD be treated without medication?",
      answer: "Yes. Psychological therapy, particularly ERP, can be effective without medication for some people. Treatment choices depend on symptom severity, personal preferences, previous treatment, and clinical assessment."
    },
    {
      question: "Which medicines are used to treat OCD?",
      answer: "Doctors may prescribe certain antidepressants, including selective serotonin reuptake inhibitors (SSRIs), to help manage OCD symptoms. The choice of medication and dosage must be determined by a qualified doctor. Do not start or stop medication without medical guidance."
    },
    {
      question: "Can OCD be completely cured?",
      answer: "OCD symptoms can improve significantly with treatment, and some people experience long periods with minimal symptoms. Others may need ongoing management. Outcomes vary, but effective treatment can help improve daily functioning and quality of life."
    },
    {
      question: "Is excessive handwashing always a sign of OCD?",
      answer: "No. Frequent handwashing does not automatically mean someone has OCD. It may be a symptom when driven by persistent, distressing obsessions or compulsions that consume considerable time or interfere with daily life."
    },
    {
      question: "Can OCD affect work, studies, and relationships?",
      answer: "Yes. OCD can interfere with concentration, productivity, relationships, and everyday activities. Repetitive rituals and intrusive thoughts can consume time and cause distress. Appropriate treatment can help people manage these difficulties."
    },
    {
      question: "Are unwanted or disturbing thoughts a sign of OCD?",
      answer: "Unwanted intrusive thoughts can occur in OCD, but having an intrusive thought does not automatically mean a person has OCD or wants to act on it. A qualified mental health professional can assess the nature of these thoughts and determine whether treatment is needed."
    },
    {
      question: "How long does OCD treatment take?",
      answer: "Treatment duration varies depending on symptom severity, individual needs, and response to therapy or medication. ERP often involves multiple structured sessions and regular practice between sessions. Consistent follow-up can support progress."
    },
    {
      question: "Can stress make OCD symptoms worse?",
      answer: "Yes. Stress, fatigue, and major life changes may worsen OCD symptoms in some people. Stress-management strategies can be helpful alongside evidence-based OCD treatment."
    },
    {
      question: "Can OCD return after treatment?",
      answer: "Symptoms may recur or become more noticeable during stressful periods. Learning ERP techniques, recognising early warning signs, and seeking follow-up care when needed can help manage a recurrence."
    },
    {
      question: "When should I seek professional help for OCD?",
      answer: "Consider consulting a mental health professional if unwanted thoughts or repetitive behaviours cause significant distress, take up substantial time, or interfere with work, relationships, or everyday activities."
    },
    {
      question: "How can I book an appointment for OCD treatment at Kelkar Manas Health Care Clinic?",
      answer: "You can contact Kelkar Manas Health Care Clinic using the contact details listed on our website to enquire about mental health consultations and available treatment options. A qualified professional can assess your concerns and guide you towards suitable care."
    }
  ],

  // 4. Hysteria
  "treatment-of-hysteria": [
    {
      question: "What is Hysteria?",
      answer: "“Hysteria” is an outdated medical term that was historically used to describe various emotional, psychological, and physical symptoms. Today, these symptoms are assessed individually and may sometimes be associated with conditions such as Functional Neurological Disorder (FND), anxiety disorders, or dissociative disorders."
    },
    {
      question: "What are the symptoms commonly associated with Hysteria?",
      answer: "Symptoms may include episodes of intense emotional distress, unexplained weakness, difficulty speaking, tremors, episodes of unresponsiveness, or changes in movement and sensation. The symptoms and their causes can vary from person to person."
    },
    {
      question: "What causes symptoms historically described as Hysteria?",
      answer: "There is no single cause. Depending on the condition, symptoms may be associated with psychological stress, nervous system functioning, trauma, or other medical and neurological factors. A proper assessment is important to identify the underlying cause."
    },
    {
      question: "Can Hysteria be treated?",
      answer: "Yes. Many conditions historically described as hysteria can be managed with appropriate treatment. The treatment approach depends on the diagnosis and may include psychological therapy, rehabilitation, medication for specific symptoms, or other medical interventions."
    },
    {
      question: "What is the treatment for Hysteria?",
      answer: "Treatment depends on the person's symptoms and clinical diagnosis. Options may include psychotherapy, cognitive behavioural therapy (CBT), stress-management techniques, physiotherapy for certain movement symptoms, and treatment of any underlying medical or mental health condition."
    },
    {
      question: "Can psychological stress cause physical symptoms?",
      answer: "Yes. Stress and emotional difficulties can contribute to physical symptoms in some people. However, physical symptoms should not automatically be attributed to psychological causes without appropriate medical evaluation."
    },
    {
      question: "Is Hysteria the same as a mental illness?",
      answer: "“Hysteria” is not a current specific psychiatric diagnosis. Similar symptoms may occur in different medical or mental health conditions, each requiring its own assessment and treatment."
    },
    {
      question: "Can symptoms associated with Hysteria be treated without medication?",
      answer: "In some cases, yes. Psychological therapy, rehabilitation, education about the condition, and supportive care may be helpful. Medication may be appropriate for certain coexisting conditions or specific symptoms, depending on a doctor's assessment."
    },
    {
      question: "Can Hysteria symptoms return after treatment?",
      answer: "Symptoms may recur depending on the underlying condition and individual circumstances. Follow-up care, appropriate therapy, and learning symptom-management techniques may help support long-term recovery."
    },
    {
      question: "When should I seek medical help?",
      answer: "Seek professional evaluation if you experience recurring episodes, unexplained changes in movement or sensation, emotional distress, or symptoms that interfere with daily life. Sudden weakness, loss of consciousness, a first seizure-like episode, or sudden difficulty speaking requires urgent medical assessment."
    },
    {
      question: "How can I support someone experiencing these symptoms?",
      answer: "Remain calm, provide reassurance, and treat the person with dignity. Avoid blaming, shaming, or assuming that symptoms are intentional. Encourage appropriate medical evaluation and follow professional guidance."
    },
    {
      question: "How can I book a consultation at Kelkar Manas Health Care Clinic?",
      answer: "You can contact Kelkar Manas Health Care Clinic through the contact details provided on our website to enquire about available consultations. A qualified healthcare professional can assess the symptoms and recommend an appropriate care plan."
    }
  ],

  // 5. Depression
  "treatment-of-depression": [
    {
      question: "What is Depression?",
      answer: "Depression is a mental health condition that can affect a person's mood, thoughts, energy levels, sleep, and daily activities. It is more than temporary sadness and may require professional support and treatment."
    },
    {
      question: "What are the common symptoms of Depression?",
      answer: "Common symptoms include persistent sadness, loss of interest in activities, fatigue, changes in sleep or appetite, difficulty concentrating, feelings of worthlessness, and hopelessness. Symptoms can vary from person to person."
    },
    {
      question: "What causes Depression?",
      answer: "Depression may develop due to a combination of genetic, biological, psychological, and environmental factors. Stressful life events, medical conditions, family history, and certain medications may also contribute."
    },
    {
      question: "Can Depression be treated?",
      answer: "Yes. Depression is treatable, and many people improve with appropriate care. Treatment may include psychotherapy, medication, lifestyle support, or a combination tailored to the individual's needs."
    },
    {
      question: "What is the best treatment for Depression?",
      answer: "The appropriate treatment depends on the severity of symptoms, medical history, and personal circumstances. Evidence-based options include cognitive behavioural therapy (CBT), other forms of psychotherapy, and antidepressant medication when indicated."
    },
    {
      question: "Can Depression be treated without medication?",
      answer: "Yes. Psychotherapy may be suitable for many people, particularly those with milder symptoms. For moderate or severe depression, medication may also be recommended. A qualified mental health professional can help determine the appropriate approach."
    },
    {
      question: "How long does Depression treatment take?",
      answer: "Treatment duration varies from person to person. Some people notice improvement within a few weeks, while others need several months or longer. Regular follow-up and adherence to the recommended treatment plan are important."
    },
    {
      question: "Can Depression affect physical health?",
      answer: "Yes. Depression may be associated with fatigue, headaches, body aches, digestive problems, sleep disturbances, and changes in appetite. Physical symptoms should also be evaluated to identify any underlying medical causes."
    },
    {
      question: "Can stress lead to Depression?",
      answer: "Prolonged stress or difficult life events may contribute to depression in some people. However, depression usually involves multiple interacting factors and is not a sign of personal weakness."
    },
    {
      question: "Can Depression occur without an obvious reason?",
      answer: "Yes. Depression can develop even when there is no clearly identifiable trigger. Genetic, biological, psychological, and environmental factors may all play a role."
    },
    {
      question: "Can Depression return after treatment?",
      answer: "Depression can recur in some people. Continuing treatment as advised, recognising early warning signs, maintaining supportive routines, and attending follow-up appointments may help reduce the risk of relapse."
    },
    {
      question: "How can lifestyle changes help manage Depression?",
      answer: "Regular physical activity, a consistent sleep schedule, balanced nutrition, social support, and manageable daily routines may support recovery. These measures can complement professional treatment but should not replace it when treatment is needed."
    },
    {
      question: "When should I consult a doctor for Depression?",
      answer: "Consider seeking professional help if low mood, loss of interest, or other symptoms persist for around two weeks, worsen, or interfere with daily life. You do not need to wait two weeks if symptoms are severe or you are concerned about your wellbeing."
    },
    {
      question: "Can Depression affect relationships and work?",
      answer: "Yes. Depression can affect communication, motivation, concentration, relationships, and work performance. Appropriate treatment and support can help people manage these challenges and improve daily functioning."
    },
    {
      question: "How can I support a family member experiencing Depression?",
      answer: "Listen without judgement, offer practical support, encourage professional help, and stay connected. Avoid blaming the person or suggesting that they should simply overcome their feelings through willpower."
    },
    {
      question: "How can I book an appointment for Depression treatment at Kelkar Manas Health Care Clinic?",
      answer: "You can contact Kelkar Manas Health Care Clinic using the contact details listed on our website to enquire about mental health consultations and available treatment options. A qualified professional can assess your symptoms and discuss a suitable care plan."
    }
  ],

  // 6. Anxiety
  "treatment-of-anxiety": [
    {
      question: "What is Anxiety?",
      answer: "Anxiety is a natural response to stress, but excessive or persistent anxiety may indicate an anxiety disorder that affects daily life, relationships, sleep, and concentration."
    },
    {
      question: "What are the common symptoms of Anxiety?",
      answer: "Symptoms may include excessive worry, restlessness, a racing heartbeat, sweating, muscle tension, difficulty concentrating, and sleep disturbances."
    },
    {
      question: "What causes Anxiety Disorders?",
      answer: "Anxiety may develop due to a combination of genetic, biological, psychological, and environmental factors, including prolonged stress and certain medical conditions."
    },
    {
      question: "Can Anxiety be treated?",
      answer: "Yes. Anxiety disorders are treatable. Depending on the individual's needs, treatment may include psychotherapy, medication, and lifestyle changes."
    },
    {
      question: "What is the best treatment for Anxiety?",
      answer: "Cognitive Behavioural Therapy (CBT) is an established treatment for many anxiety disorders. Medication may also be recommended following a professional assessment."
    },
    {
      question: "Can Anxiety be treated without medication?",
      answer: "Yes. Psychological therapies, relaxation techniques, and lifestyle support may help many people manage anxiety without medication."
    },
    {
      question: "When should I seek professional help for Anxiety?",
      answer: "Consider consulting a mental health professional if anxiety is persistent, difficult to control, or interferes with sleep, work, relationships, or daily activities."
    },
    {
      question: "How can I book an Anxiety consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic using the details provided on our website to enquire about consultations and available treatment options."
    }
  ],

  // 7. Alcohol Addiction
  "treatment-of-alcohol-addiction": [
    {
      question: "What is Alcohol Addiction?",
      answer: "Alcohol addiction, also known as Alcohol Use Disorder (AUD), is a medical condition in which a person finds it difficult to control alcohol consumption despite its negative effects on health and daily life."
    },
    {
      question: "What are the signs of Alcohol Addiction?",
      answer: "Signs may include strong cravings, drinking more than intended, unsuccessful attempts to stop, increased tolerance, withdrawal symptoms, and continued drinking despite personal or professional problems."
    },
    {
      question: "Can Alcohol Addiction be treated?",
      answer: "Yes. Alcohol addiction is treatable. Care may include medical assessment, supervised withdrawal management, counselling, psychological therapy, medication, and ongoing recovery support."
    },
    {
      question: "What is the treatment for Alcohol Addiction?",
      answer: "Treatment depends on the severity of alcohol use and the person's medical condition. A doctor may recommend supervised detoxification, behavioural therapies, appropriate medication, and relapse-prevention support."
    },
    {
      question: "Is alcohol detoxification safe at home?",
      answer: "Withdrawal from alcohol can sometimes cause serious complications, including seizures and delirium. People who may be dependent on alcohol should seek medical advice before stopping. Medically supervised withdrawal may be necessary."
    },
    {
      question: "How long does Alcohol Addiction treatment take?",
      answer: "Treatment duration varies. Initial withdrawal management may take several days, while recovery support and relapse prevention may continue for weeks, months, or longer."
    },
    {
      question: "Can someone recover from Alcohol Addiction?",
      answer: "Yes. Many people achieve meaningful, sustained recovery with appropriate treatment and ongoing support. Relapse can occur, but it is a reason to reassess treatment rather than give up."
    },
    {
      question: "How can I seek Alcohol Addiction treatment at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about addiction assessment, available treatment services, and the appropriate next steps for recovery."
    }
  ],

  // 8. Sexual Health Treatment
  "sexual-health-problems": [
    {
      question: "What sexual health problems can be treated?",
      answer: "Sexual health concerns may include erectile dysfunction, premature ejaculation, low sexual desire, performance anxiety, painful intercourse, and other difficulties affecting sexual wellbeing."
    },
    {
      question: "What causes sexual health problems?",
      answer: "Possible causes include medical conditions, hormonal changes, stress, anxiety, relationship difficulties, lifestyle factors, and certain medications. A proper assessment helps identify potential causes."
    },
    {
      question: "Are sexual health problems treatable?",
      answer: "Many sexual health concerns can be treated or managed effectively. Treatment depends on the underlying cause and may include counselling, lifestyle changes, medical treatment, or a combination of approaches."
    },
    {
      question: "What is the treatment for erectile dysfunction?",
      answer: "Treatment depends on the cause and may include lifestyle modifications, management of underlying health conditions, counselling, or prescribed medication following a medical assessment."
    },
    {
      question: "Can premature ejaculation be treated?",
      answer: "Yes. Depending on the individual, treatment may include behavioural techniques, psychological counselling, and medication when clinically appropriate."
    },
    {
      question: "Can stress and anxiety affect sexual performance?",
      answer: "Yes. Stress, performance anxiety, depression, and relationship difficulties may affect sexual desire and performance. Physical causes should also be considered during assessment."
    },
    {
      question: "Is sexual health consultation confidential?",
      answer: "Sexual health concerns should be discussed in a respectful and private clinical environment. Patient information is handled according to applicable privacy laws and professional requirements."
    },
    {
      question: "How can I book a sexual health consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic using the details on our website to enquire about available consultations and appropriate treatment options."
    }
  ],

  // 9. Child & Adolescent Psychiatry
  "child-and-adolescent-psychiatry": [
    {
      question: "What is Child and Adolescent Psychiatry?",
      answer: "Child and adolescent psychiatry focuses on assessing, diagnosing, and treating emotional, behavioural, developmental, and mental health concerns in children and teenagers."
    },
    {
      question: "What problems can a child psychiatrist help with?",
      answer: "A child psychiatrist may assess concerns such as anxiety, depression, behavioural difficulties, ADHD, emotional regulation problems, and certain developmental or psychiatric conditions."
    },
    {
      question: "What are the signs that a child may need mental health support?",
      answer: "Persistent mood changes, social withdrawal, difficulties at school, unusual behavioural changes, sleep problems, excessive fears, or ongoing difficulties with daily functioning may indicate a need for assessment."
    },
    {
      question: "Can children experience Anxiety and Depression?",
      answer: "Yes. Children and teenagers can experience anxiety disorders and depression. Symptoms may appear as irritability, physical complaints, withdrawal, changes in sleep, or declining school performance."
    },
    {
      question: "How are mental health conditions in children treated?",
      answer: "Treatment may involve age-appropriate psychotherapy, parent guidance, family interventions, school support, and medication when clinically indicated."
    },
    {
      question: "Should parents attend the consultation?",
      answer: "Parent or caregiver involvement is often helpful, particularly for younger children. The clinician may also speak with the child or adolescent individually when appropriate."
    },
    {
      question: "When should parents seek professional help?",
      answer: "Seek an assessment when emotional, behavioural, or developmental concerns persist, cause distress, or interfere with education, relationships, or everyday activities."
    },
    {
      question: "How can I book a child psychiatry consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about available child and adolescent mental health assessment and consultation services."
    }
  ],

  // 10. Geriatric Psychiatry
  "geriatric-psychiatry": [
    {
      question: "What is Geriatric Psychiatry?",
      answer: "Geriatric psychiatry focuses on the mental health of older adults, including the assessment and treatment of depression, anxiety, sleep difficulties, and certain cognitive or behavioural changes."
    },
    {
      question: "What mental health problems can affect older adults?",
      answer: "Older adults may experience depression, anxiety, loneliness, sleep disorders, dementia-related symptoms, or emotional difficulties associated with health changes and life transitions."
    },
    {
      question: "Are depression and anxiety common in older adults?",
      answer: "Yes. Older adults can experience depression and anxiety, but these conditions should not be considered an inevitable part of ageing. Professional assessment and treatment can help."
    },
    {
      question: "How can I recognise possible mental health concerns in an older person?",
      answer: "Warning signs may include persistent sadness, withdrawal from activities, changes in sleep or appetite, unusual confusion, increased irritability, or difficulties managing daily tasks."
    },
    {
      question: "What is the treatment for mental health problems in older adults?",
      answer: "Treatment may include psychotherapy, medication when appropriate, caregiver support, lifestyle interventions, and coordination with other healthcare professionals."
    },
    {
      question: "Is memory loss always a sign of dementia?",
      answer: "No. Memory problems may have several causes, including medication effects, sleep difficulties, depression, vitamin deficiencies, or neurological conditions. A medical assessment is important."
    },
    {
      question: "How can family members support an older adult?",
      answer: "Family members can offer emotional support, encourage appropriate medical care, help with appointments, and communicate changes in mood, memory, or daily functioning to the healthcare team."
    },
    {
      question: "How can I arrange a geriatric psychiatry consultation?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about mental health assessment and consultation options for older adults."
    }
  ],

  // 11. Cognitive Behavioural Therapy
  "cognitive-behavioural-therapy": [
    {
      question: "What is Cognitive Behavioural Therapy (CBT)?",
      answer: "CBT is a structured psychological treatment that helps people identify and change unhelpful patterns of thinking and behaviour that contribute to emotional distress."
    },
    {
      question: "Which conditions can CBT help treat?",
      answer: "CBT may help manage conditions such as anxiety disorders, depression, panic disorder, phobias, obsessive-compulsive disorder, and certain sleep-related difficulties."
    },
    {
      question: "How does CBT work?",
      answer: "CBT helps individuals recognise connections between thoughts, feelings, physical sensations, and behaviours. People learn practical strategies to respond to difficulties in healthier ways."
    },
    {
      question: "How many CBT sessions are required?",
      answer: "The number of sessions depends on the condition, its severity, and individual goals. CBT is often delivered over a structured course of sessions, with practice between appointments."
    },
    {
      question: "Is CBT effective?",
      answer: "CBT is an evidence-based psychological treatment for several mental health conditions. Outcomes vary, and some people may benefit from additional treatments or ongoing support."
    },
    {
      question: "Can CBT be used without medication?",
      answer: "Yes. CBT can be used on its own or alongside medication, depending on the condition, the person's preferences, and clinical recommendations."
    },
    {
      question: "What happens during a CBT session?",
      answer: "Sessions may involve discussing current difficulties, identifying unhelpful thought patterns, practising coping strategies, setting goals, and planning exercises to practise between sessions."
    },
    {
      question: "How can I enquire about CBT at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to ask about psychological therapy consultations and the availability of CBT for your concerns."
    }
  ],

  // 12. Nicotine De-Addiction
  "nicotine-de-addiction": [
    {
      question: "What is Nicotine Addiction?",
      answer: "Nicotine addiction is a condition in which a person develops dependence on nicotine, a substance found in tobacco products and many e-cigarettes. It can make quitting difficult despite a desire to stop."
    },
    {
      question: "What products can cause nicotine dependence?",
      answer: "Nicotine dependence can develop through cigarettes, bidis, smokeless tobacco products, and nicotine-containing vaping products."
    },
    {
      question: "What are the symptoms of Nicotine Addiction?",
      answer: "Symptoms may include strong cravings, difficulty quitting, irritability when not using nicotine, restlessness, difficulty concentrating, and continued use despite health concerns."
    },
    {
      question: "Can Nicotine Addiction be treated?",
      answer: "Yes. Evidence-based approaches include behavioural counselling, quit-support programmes, and approved medications or nicotine replacement therapy when appropriate."
    },
    {
      question: "What happens when someone stops using nicotine?",
      answer: "Withdrawal symptoms may include cravings, irritability, anxiety, difficulty concentrating, changes in sleep, and increased appetite. These symptoms usually improve over time."
    },
    {
      question: "Is it possible to quit tobacco after many years?",
      answer: "Yes. Quitting can benefit health at any age, even after many years of tobacco use. Professional support may improve the likelihood of success."
    },
    {
      question: "Can medication help with Nicotine De-Addiction?",
      answer: "Certain medicines and nicotine replacement products can help reduce cravings and withdrawal symptoms. A healthcare professional can advise which options are appropriate."
    },
    {
      question: "How can I seek Nicotine De-Addiction support at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about available tobacco cessation counselling, addiction assessment, and treatment options."
    }
  ],

  // 13. Brown Sugar De-Addiction
  "brown-sugar-de-addiction": [
    {
      question: "What is Brown Sugar Addiction?",
      answer: "In some regions, “brown sugar” refers to an illicit heroin preparation. It is an opioid that can cause dependence, serious health complications, and potentially fatal overdose."
    },
    {
      question: "What are the signs of Brown Sugar Addiction?",
      answer: "Possible signs include strong cravings, increasing difficulty controlling use, withdrawal symptoms, changes in daily routines, and continued use despite health, financial, or relationship problems."
    },
    {
      question: "Can Brown Sugar Addiction be treated?",
      answer: "Yes. Opioid use disorder is treatable. Care may include medical assessment, evidence-based medication treatment, counselling, withdrawal management, and long-term recovery support."
    },
    {
      question: "What happens during opioid withdrawal?",
      answer: "Withdrawal may cause muscle aches, sweating, restlessness, anxiety, abdominal cramps, nausea, diarrhoea, and sleep difficulties. Medical guidance can help manage symptoms and support safer recovery."
    },
    {
      question: "Is it safe to stop Brown Sugar suddenly?",
      answer: "Stopping can cause significant withdrawal symptoms and may increase the risk of relapse and overdose if opioid use resumes after tolerance decreases. A medically guided treatment plan is recommended."
    },
    {
      question: "Are medicines available for opioid addiction?",
      answer: "Yes. Depending on clinical assessment and local availability, evidence-based treatments may include buprenorphine or methadone, alongside appropriate psychosocial support."
    },
    {
      question: "Can someone recover from Brown Sugar Addiction?",
      answer: "Yes. Many people improve with appropriate treatment and continued support. Recovery may require ongoing care, relapse prevention, and treatment of coexisting physical or mental health concerns."
    },
    {
      question: "When is emergency medical help needed?",
      answer: "Slow or absent breathing, inability to wake the person, or blue or grey lips may indicate an opioid overdose. Call emergency services immediately and administer naloxone if available, following its instructions."
    },
    {
      question: "How can I enquire about Brown Sugar De-Addiction at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to ask about addiction assessment, available treatment services, and appropriate next steps for recovery."
    }
  ],

  // 14. Schizophrenia
  "schizophrenia": [
    {
      question: "What is Schizophrenia?",
      answer: "Schizophrenia is a mental health condition that can affect perception, thinking, emotions, and behaviour. Symptoms and their severity vary among individuals."
    },
    {
      question: "What are the common symptoms of Schizophrenia?",
      answer: "Symptoms may include hallucinations, delusions, disorganised thinking or speech, reduced motivation, social withdrawal, and difficulties with everyday functioning."
    },
    {
      question: "What causes Schizophrenia?",
      answer: "The exact cause is not fully understood. Genetic vulnerability, brain-related factors, and environmental influences may contribute to its development."
    },
    {
      question: "Can Schizophrenia be treated?",
      answer: "Yes. Treatment can help manage symptoms, reduce the risk of relapse, and improve quality of life. Many people benefit from ongoing, individualised care."
    },
    {
      question: "What is the treatment for Schizophrenia?",
      answer: "Treatment commonly includes antipsychotic medication, psychiatric follow-up, psychological and family interventions, and rehabilitation or social support when appropriate."
    },
    {
      question: "Does Schizophrenia require long-term treatment?",
      answer: "Many people benefit from long-term treatment and monitoring. The duration and type of care depend on symptoms, treatment response, side effects, and individual circumstances."
    },
    {
      question: "Can people with Schizophrenia live independently?",
      answer: "Many people with schizophrenia can pursue education, work, relationships, and independent living with suitable treatment and support. Individual outcomes vary."
    },
    {
      question: "How can family members support someone with Schizophrenia?",
      answer: "Families can encourage treatment adherence, communicate calmly, learn about the condition, and seek professional advice when symptoms change. Avoid blaming or stigmatising the person."
    },
    {
      question: "When should I seek urgent help?",
      answer: "Seek urgent assistance if the person is at immediate risk of harming themselves or someone else, is severely confused, or cannot meet basic safety needs."
    },
    {
      question: "How can I book a Schizophrenia consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about psychiatric assessment, treatment options, and ongoing mental health support."
    }
  ],

  // 15. Irritable Bowel Syndrome (IBS)
  "ibs": [
    {
      question: "What is Irritable Bowel Syndrome (IBS)?",
      answer: "IBS is a common disorder of gut-brain interaction that can cause abdominal pain, bloating, and changes in bowel habits, including diarrhoea, constipation, or both."
    },
    {
      question: "What are the common symptoms of IBS?",
      answer: "Symptoms may include recurring abdominal discomfort, bloating, excess gas, diarrhoea, constipation, and changes in stool frequency or appearance."
    },
    {
      question: "What causes IBS?",
      answer: "The exact cause is not fully understood. Factors may include changes in gut movement, gut sensitivity, interactions between the brain and digestive system, and previous gastrointestinal infections."
    },
    {
      question: "Can stress make IBS symptoms worse?",
      answer: "Yes. Stress and anxiety can worsen symptoms in some people because the brain and digestive system communicate closely. However, IBS symptoms are real and should not be dismissed as being imaginary or purely psychological."
    },
    {
      question: "Can IBS be treated?",
      answer: "Yes. Although IBS may be a long-term condition, symptoms can often be managed through dietary changes, lifestyle adjustments, medicines, and psychological therapies when appropriate."
    },
    {
      question: "What foods should people with IBS avoid?",
      answer: "Food triggers vary. Some people benefit from identifying personal triggers or following a supervised low-FODMAP diet for a limited period. A qualified healthcare professional or dietitian can guide dietary changes."
    },
    {
      question: "Can psychological therapy help with IBS?",
      answer: "Some people benefit from gut-directed psychological therapies, including CBT, particularly when symptoms are associated with stress or persist despite standard treatment."
    },
    {
      question: "When should I consult a doctor for digestive symptoms?",
      answer: "Seek medical assessment for persistent symptoms. Blood in the stool, unexplained weight loss, fever, anaemia, or symptoms that wake you regularly at night warrant prompt evaluation because they may indicate another condition."
    },
    {
      question: "How can I seek help for IBS at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about available consultations. Depending on your symptoms, assessment by a primary care doctor or gastroenterologist may also be appropriate."
    }
  ],

  // 16. Mania and Bipolar Disorder
  "mania": [
    {
      question: "What is Mania?",
      answer: "Mania is a period of abnormally elevated, expansive, or irritable mood accompanied by increased energy or activity. It may affect sleep, judgement, behaviour, and daily functioning."
    },
    {
      question: "What are the common symptoms of Mania?",
      answer: "Symptoms may include unusually high energy, reduced need for sleep, racing thoughts, rapid speech, increased confidence, impulsive decisions, irritability, and risky behaviour."
    },
    {
      question: "What is the connection between Mania and Bipolar Disorder?",
      answer: "Mania is a defining feature of Bipolar I Disorder. Bipolar disorder can involve episodes of mania or hypomania and, in many cases, episodes of depression. A professional assessment is necessary to establish the diagnosis."
    },
    {
      question: "What causes Mania?",
      answer: "Mania may be associated with bipolar disorder, genetic vulnerability, sleep disruption, certain medications, or substance use. Medical conditions can also cause similar symptoms and may need to be ruled out."
    },
    {
      question: "Can Mania be treated?",
      answer: "Yes. Mania can be treated with appropriate psychiatric care. Treatment may involve mood-stabilising medication, antipsychotic medication, monitoring, and supportive interventions."
    },
    {
      question: "Does a person experiencing Mania need hospitalisation?",
      answer: "Hospitalisation may be necessary if symptoms are severe, judgement is significantly impaired, the person is behaving dangerously, or they cannot maintain their own safety. The decision depends on clinical assessment."
    },
    {
      question: "How is Bipolar Disorder managed over the long term?",
      answer: "Long-term care may include prescribed medication, regular psychiatric follow-up, consistent sleep routines, monitoring of mood changes, psychotherapy, and support from family or caregivers."
    },
    {
      question: "Can lack of sleep trigger Mania?",
      answer: "Sleep disruption can contribute to mood episodes in susceptible individuals. Maintaining a regular sleep schedule and recognising early warning signs are important parts of ongoing care."
    },
    {
      question: "How can family members support someone experiencing Mania?",
      answer: "Stay calm, reduce unnecessary stimulation, encourage professional assessment, and avoid confrontations about unusual beliefs or impulsive decisions. Seek urgent help if safety is at risk."
    },
    {
      question: "When should I seek urgent psychiatric help?",
      answer: "Seek urgent assessment if someone has severe agitation, rapidly escalating risky behaviour, psychotic symptoms, or very little sleep accompanied by increasing energy and impaired judgement."
    },
    {
      question: "How can I book a consultation for Mania or Bipolar Disorder at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic using the details on our website to enquire about psychiatric assessment, treatment, and ongoing care."
    }
  ],

  // Exact FAQs from Topic-Wise FAQs for Sexual Problems Pages.pdf
  "erectile-dysfunction": [
    {
      question: "What is Erectile Dysfunction?",
      answer: "Erectile Dysfunction (ED) is the persistent or recurring difficulty in achieving or maintaining an erection sufficient for satisfactory sexual activity."
    },
    {
      question: "What causes Erectile Dysfunction?",
      answer: "ED may be associated with diabetes, high blood pressure, cardiovascular conditions, hormonal changes, stress, anxiety, smoking, or certain medications."
    },
    {
      question: "Can Erectile Dysfunction be treated?",
      answer: "Yes. Treatment depends on the underlying cause and may include lifestyle changes, counselling, management of medical conditions, and prescribed medication."
    },
    {
      question: "Can stress and anxiety cause Erectile Dysfunction?",
      answer: "Yes. Stress, performance anxiety, depression, and relationship difficulties can contribute to ED. Physical and psychological factors may also occur together."
    },
    {
      question: "Is Erectile Dysfunction common in young men?",
      answer: "ED can affect adults of different ages. Persistent erection difficulties in younger men should also be assessed rather than automatically attributed to psychological causes."
    },
    {
      question: "Are medicines for Erectile Dysfunction safe?",
      answer: "Some prescribed medicines can help, but they are not suitable for everyone. Medicines such as sildenafil and tadalafil can interact dangerously with nitrate medications. Consult a qualified doctor before using them."
    },
    {
      question: "When should I consult a doctor for Erectile Dysfunction?",
      answer: "Seek medical advice if erection difficulties occur repeatedly, cause distress, or affect your relationships. A consultation can help identify possible causes and appropriate treatment options."
    },
    {
      question: "How can I book an Erectile Dysfunction consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic using the details listed on our website to enquire about sexual health consultations and available treatment options."
    }
  ],
  "premature-ejaculation": [
    {
      question: "What is Premature Ejaculation?",
      answer: "Premature Ejaculation (PE) is a common sexual concern in which ejaculation occurs sooner than desired, often causing distress or difficulty with sexual satisfaction."
    },
    {
      question: "What causes Premature Ejaculation?",
      answer: "Possible contributing factors include performance anxiety, stress, relationship concerns, heightened sensitivity, and certain medical or psychological conditions."
    },
    {
      question: "Can Premature Ejaculation be treated?",
      answer: "Yes. Treatment may include behavioural techniques, counselling, prescribed medication, or a combination of approaches depending on the individual's needs."
    },
    {
      question: "How can I improve ejaculation control?",
      answer: "Behavioural approaches such as the start-stop technique may help some individuals. A healthcare professional can also assess contributing factors and recommend suitable treatment."
    },
    {
      question: "Is Premature Ejaculation a sign of sexual weakness?",
      answer: "No. PE is a recognised sexual health concern and does not determine a person's masculinity or overall health."
    },
    {
      question: "Can anxiety make Premature Ejaculation worse?",
      answer: "Yes. Worry about sexual performance can contribute to a cycle of anxiety and early ejaculation. Psychological support may be helpful when anxiety plays a role."
    },
    {
      question: "Do medicines help with Premature Ejaculation?",
      answer: "Certain prescription medicines may help selected individuals. Their suitability depends on medical history, other medications, side effects, and clinical assessment."
    },
    {
      question: "When should I seek treatment for Premature Ejaculation?",
      answer: "Consider a consultation if the problem happens repeatedly, causes distress, or affects your sexual relationship."
    },
    {
      question: "How can I book a consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about sexual health consultations and appropriate treatment options for premature ejaculation."
    }
  ],
  "sexual-performance-anxiety": [
    {
      question: "What is Sexual Performance Anxiety?",
      answer: "Sexual performance anxiety is fear or worry about sexual performance, satisfying a partner, maintaining an erection, or reaching orgasm. It can interfere with sexual enjoyment and confidence."
    },
    {
      question: "What are the symptoms of Performance Anxiety?",
      answer: "Symptoms may include nervousness before intimacy, excessive worry, difficulty maintaining an erection, reduced sexual desire, rapid ejaculation, or difficulty reaching orgasm."
    },
    {
      question: "What causes Sexual Performance Anxiety?",
      answer: "It may be associated with fear of failure, previous negative experiences, relationship concerns, stress, low confidence, or unrealistic expectations about sexual performance."
    },
    {
      question: "Can Performance Anxiety cause Erectile Dysfunction?",
      answer: "Yes. Anxiety can interfere with the physical and emotional processes involved in sexual arousal and contribute to erection difficulties."
    },
    {
      question: "How can Sexual Performance Anxiety be treated?",
      answer: "Treatment may include psychological counselling, cognitive behavioural therapy (CBT), relaxation techniques, communication strategies, and treatment of any underlying sexual health condition."
    },
    {
      question: "Can Performance Anxiety be overcome without medication?",
      answer: "Yes. Some individuals benefit from counselling, behavioural strategies, and reducing performance pressure without medication. Treatment depends on the underlying cause."
    },
    {
      question: "Can relationship problems contribute to Performance Anxiety?",
      answer: "Yes. Communication difficulties, unresolved conflict, and concerns about intimacy can contribute to anxiety. Couple counselling may help when appropriate."
    },
    {
      question: "When should I seek professional help?",
      answer: "Consider professional support when anxiety repeatedly interferes with intimacy, sexual satisfaction, confidence, or relationships."
    },
    {
      question: "How can I book a consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic through our website to enquire about sexual health counselling and consultation options."
    }
  ],
  "sexually-transmitted-infections": [
    {
      question: "What are Sexually Transmitted Infections (STIs)?",
      answer: "STIs are infections that can be transmitted through sexual contact. Examples include chlamydia, gonorrhoea, syphilis, genital herpes, human papillomavirus (HPV), and HIV."
    },
    {
      question: "What are the common symptoms of STIs?",
      answer: "Symptoms may include unusual genital discharge, painful urination, sores, blisters, itching, rashes, or pelvic discomfort. However, many STIs cause no noticeable symptoms."
    },
    {
      question: "Can STIs occur without symptoms?",
      answer: "Yes. A person can have and transmit certain STIs without experiencing symptoms. Testing may be recommended depending on sexual exposure and individual risk."
    },
    {
      question: "How are STIs diagnosed?",
      answer: "Diagnosis may involve urine tests, blood tests, swabs, or physical examination, depending on the suspected infection and clinical circumstances."
    },
    {
      question: "Can Sexually Transmitted Infections be treated?",
      answer: "Many bacterial and parasitic STIs can be cured with appropriate treatment. Viral infections may be managed with medication, although some cannot currently be completely cured."
    },
    {
      question: "How can I reduce my risk of STIs?",
      answer: "Using condoms correctly, getting appropriate vaccinations, undergoing recommended testing, and discussing sexual health with partners can reduce risk. Condoms do not eliminate every STI risk."
    },
    {
      question: "Should my partner also be tested?",
      answer: "Depending on the infection and exposure, partner testing and treatment may be important to prevent reinfection and further transmission. Follow medical advice about sexual activity during treatment."
    },
    {
      question: "When should I seek medical advice for a possible STI?",
      answer: "Seek assessment if you have symptoms, a partner has been diagnosed with an STI, or you believe you may have been exposed. Do not rely on symptoms alone to determine infection status."
    },
    {
      question: "Is STI consultation confidential?",
      answer: "Sexual health consultations should be conducted respectfully and with appropriate protection of patient privacy, subject to applicable legal and professional requirements."
    },
    {
      question: "How can I enquire about STI testing or treatment at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to ask about available sexual health assessments, testing arrangements, and appropriate referral options."
    }
  ],
  "precum": [
    {
      question: "What is Precum?",
      answer: "Precum, medically known as pre-ejaculate, is a clear fluid that may be released from the penis during sexual arousal before ejaculation."
    },
    {
      question: "Is Precum normal?",
      answer: "Yes. Pre-ejaculate is a normal bodily fluid. The amount varies between individuals and may vary from one occasion to another."
    },
    {
      question: "Can Precum cause pregnancy?",
      answer: "Yes. Pregnancy is possible if pre-ejaculate contains sperm or carries sperm remaining in the urethra into the vagina. The withdrawal method is not completely reliable for preventing pregnancy."
    },
    {
      question: "Can STIs spread through Precum?",
      answer: "Certain sexually transmitted infections can spread through sexual fluids or direct genital contact. Using condoms correctly can reduce the risk of many STIs."
    },
    {
      question: "Is excessive Precum a sign of a medical problem?",
      answer: "Not necessarily. The amount of pre-ejaculate varies naturally. However, persistent unusual discharge, pain, burning during urination, or blood should be medically evaluated."
    },
    {
      question: "Can I reduce the amount of Precum?",
      answer: "Pre-ejaculate is a normal physiological response, and there is generally no need to reduce it. Avoid taking medicines or supplements to change fluid production without medical advice."
    },
    {
      question: "Is Precum the same as semen?",
      answer: "No. Pre-ejaculate is released before ejaculation and differs from semen, which is released during ejaculation. They have different functions."
    },
    {
      question: "When should I consult a doctor about Precum?",
      answer: "Seek medical advice if the fluid has an unusual colour or smell, occurs without arousal and persists, or is accompanied by pain, itching, sores, or urinary symptoms."
    },
    {
      question: "How can I enquire about sexual health concerns at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about sexual health consultations and assessment of any symptoms that concern you."
    }
  ],
  "nocturnal-emissions": [
    {
      question: "What are Nocturnal Emissions?",
      answer: "Nocturnal emissions, commonly called wet dreams, are involuntary ejaculations that occur during sleep. They are a normal physiological experience for many people."
    },
    {
      question: "Are Nocturnal Emissions normal?",
      answer: "Yes. Wet dreams are common, particularly during adolescence and young adulthood, although they can occur at other ages as well."
    },
    {
      question: "What causes Nocturnal Emissions?",
      answer: "They may occur naturally during sleep and are associated with normal reproductive physiology. They do not necessarily indicate a sexual or medical problem."
    },
    {
      question: "Do Nocturnal Emissions cause weakness?",
      answer: "No. Normal nocturnal emissions do not cause lasting physical weakness, infertility, or a loss of masculinity."
    },
    {
      question: "How often are Nocturnal Emissions normal?",
      answer: "There is no single normal frequency. Some people experience them frequently, others occasionally, and some never experience them."
    },
    {
      question: "Can Nocturnal Emissions be prevented?",
      answer: "They are a normal bodily process and generally do not require prevention or treatment. Be cautious of products claiming to cure wet dreams without reliable medical evidence."
    },
    {
      question: "When should I consult a doctor about Nocturnal Emissions?",
      answer: "Seek medical advice if episodes are accompanied by pain, blood in the semen, urinary symptoms, or significant distress, or if you have other concerns about your sexual health."
    },
    {
      question: "How can I book a consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about sexual health consultations and professional guidance."
    }
  ],
  "masturbation-habit": [
    {
      question: "Is Masturbation normal?",
      answer: "Yes. Masturbation is a common sexual behaviour and is generally considered a normal part of human sexuality."
    },
    {
      question: "Does Masturbation cause physical weakness?",
      answer: "There is no good evidence that masturbation by itself causes lasting physical weakness, infertility, or a permanent reduction in testosterone."
    },
    {
      question: "How often is Masturbation considered normal?",
      answer: "There is no fixed normal frequency. It becomes a concern mainly when it causes physical injury, significant distress, or interference with work, relationships, sleep, or other daily activities."
    },
    {
      question: "Can Masturbation become difficult to control?",
      answer: "Some people may feel unable to control repetitive sexual behaviour, particularly when it interferes with daily responsibilities or continues despite negative consequences. Professional support may help."
    },
    {
      question: "Can Masturbation affect sexual performance?",
      answer: "Masturbation does not generally cause sexual dysfunction. However, individual habits, anxiety, unrealistic expectations, or specific patterns of stimulation may contribute to concerns for some people."
    },
    {
      question: "Can I reduce or manage a Masturbation Habit?",
      answer: "If the behaviour is interfering with your life, identifying triggers, establishing healthy routines, reducing exposure to triggering situations, and seeking counselling may help."
    },
    {
      question: "Does Masturbation cause Erectile Dysfunction or infertility?",
      answer: "Masturbation itself is not generally considered a cause of erectile dysfunction or infertility. Persistent erection or fertility concerns should be assessed by a qualified healthcare professional."
    },
    {
      question: "When should I seek professional help for Masturbation concerns?",
      answer: "Consider counselling if you experience persistent guilt or distress, repeated unsuccessful attempts to change the behaviour, physical injury, or significant interference with daily life."
    },
    {
      question: "How can I enquire about counselling at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to enquire about confidential sexual health consultations and counselling options."
    }
  ],
  "infertility": [
    {
      question: "What sexual health problems can be treated?",
      answer: "Sexual health concerns may include erectile dysfunction, premature ejaculation, low sexual desire, performance anxiety, painful intercourse, and other difficulties affecting sexual wellbeing."
    },
    {
      question: "What causes sexual health problems?",
      answer: "Possible causes include medical conditions, hormonal changes, stress, anxiety, relationship difficulties, lifestyle factors, and certain medications. A proper assessment helps identify potential causes."
    },
    {
      question: "Are sexual health problems treatable?",
      answer: "Many sexual health concerns can be treated or managed effectively. Treatment depends on the underlying cause and may include counselling, lifestyle changes, medical treatment, or a combination of approaches."
    },
    {
      question: "Is sexual health consultation confidential?",
      answer: "Sexual health concerns should be discussed in a respectful and private clinical environment. Patient information is handled according to applicable privacy laws and professional requirements."
    },
    {
      question: "How can I book a sexual health consultation at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic using the details on our website to enquire about available consultations and appropriate treatment options."
    }
  ],
  "homosexuality-counseling": [
    {
      question: "What is Homosexuality?",
      answer: "Homosexuality refers to romantic, emotional, or sexual attraction to people of the same sex. Sexual orientation is a natural aspect of human diversity."
    },
    {
      question: "Is Homosexuality a mental illness?",
      answer: "No. Homosexuality is not a mental disorder and does not require treatment or a cure."
    },
    {
      question: "What is Sexual Orientation Counselling?",
      answer: "Sexual orientation counselling provides a supportive, confidential space to explore feelings, identity, relationships, family concerns, or social pressures without judgement."
    },
    {
      question: "Can counselling change a person's sexual orientation?",
      answer: "Sexual orientation is not a disorder that needs to be changed. Attempts to force or pressure someone to change their orientation can be harmful. Ethical counselling focuses on wellbeing, self-understanding, and personal choice."
    },
    {
      question: "Can I seek counselling if I am confused about my sexual orientation?",
      answer: "Yes. You can seek support to explore your feelings and questions at your own pace. You do not need to adopt a particular label or make an immediate decision about your identity."
    },
    {
      question: "Can counselling help with family or relationship concerns?",
      answer: "Yes. Supportive counselling may help individuals navigate family reactions, relationship challenges, social stigma, stress, or concerns about disclosure."
    },
    {
      question: "Is sexual orientation counselling confidential?",
      answer: "Counselling should respect privacy and confidentiality, subject to applicable legal and professional requirements. You can ask the counsellor about confidentiality before beginning sessions."
    },
    {
      question: "Do I need counselling because I am homosexual?",
      answer: "No. Being homosexual does not mean you need mental health treatment. Counselling is an option if you want support with stress, relationships, identity exploration, or other personal concerns."
    },
    {
      question: "How can I enquire about supportive counselling at Kelkar Manas Health Care Clinic?",
      answer: "Contact Kelkar Manas Health Care Clinic to ask about available counselling services and whether a suitable, non-judgmental service is available for your concerns."
    }
  ]
};

/**
 * Returns the FAQs for a specific topic slug.
 * Strictly guarantees topic-specific isolation so FAQs are never incorrectly shared between unrelated topics.
 */
export function getTopicFaqs(slug: string, title?: string, cmsFaqs?: { question: string; answer: string }[]): TopicFaqItem[] {
  // If CMS has custom FAQs saved, use them directly
  if (cmsFaqs && cmsFaqs.length > 0) {
    return cmsFaqs;
  }

  // If we have curated FAQs from the official PDF for this slug, return them
  if (slug && TOPIC_FAQS[slug]) {
    return TOPIC_FAQS[slug];
  }

  return [];
}
