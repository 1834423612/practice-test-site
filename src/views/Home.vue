<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20 md:py-24">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-80"></div>
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-blue-400"></div>
        
        <!-- Decorative shapes -->
        <div class="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon icon="lucide:graduation-cap" class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master the SAT with 
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalized Practice
            </span>
          </h1>
          
          <p class="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
            Improve your scores with our adaptive practice platform designed specifically for the digital SAT format.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link 
              to="/practice" 
              @click="trackStartPractice"
              class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Icon icon="lucide:play" class="mr-2 w-5 h-5" />
              Start Practicing
            </router-link>
            
            <a 
              href="#features" 
              class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center justify-center"
            >
              <Icon icon="lucide:info" class="mr-2 w-5 h-5" />
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
            <div class="text-sm text-gray-600">Official Questions</div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-purple-600 mb-2">4</div>
            <div class="text-sm text-gray-600">Subject Areas</div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div class="text-sm text-gray-600">Access</div>
          </div>
          
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 text-center shadow-sm">
            <div class="text-3xl font-bold text-amber-600 mb-2">100%</div>
            <div class="text-sm text-gray-600">Free</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-16 sm:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Designed for Success</h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Our platform offers comprehensive features to help you excel on test day.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
              <Icon icon="lucide:book-open" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Official Questions</h3>
            <p class="text-gray-600">
              Practice with 1,000+ official College Board questions from real SAT exams, covering all test sections.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
              <Icon icon="lucide:bar-chart-3" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Performance Analytics</h3>
            <p class="text-gray-600">
              Track your progress with detailed analytics and personalized recommendations to focus your study time.
            </p>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div class="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
              <Icon icon="lucide:history" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Wrong Questions Review</h3>
            <p class="text-gray-600">
              Easily review and practice questions you've answered incorrectly to strengthen your weak areas.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 sm:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Our simple process helps you focus on what matters most - improving your score.
          </p>
        </div>
        
        <div class="relative">
          <!-- Connection line -->
          <div class="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200"></div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center relative">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                <span class="text-xl font-bold text-white">1</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Choose Your Focus</h3>
              <p class="text-gray-600">
                Select the exam type and specific sections you want to practice.
              </p>
            </div>
            
            <div class="text-center relative">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                <span class="text-xl font-bold text-white">2</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Practice Questions</h3>
              <p class="text-gray-600">
                Answer questions in a realistic digital SAT environment.
              </p>
            </div>
            
            <div class="text-center relative">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                <span class="text-xl font-bold text-white">3</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Get Instant Feedback</h3>
              <p class="text-gray-600">
                Review detailed explanations for each question you answer.
              </p>
            </div>
            
            <div class="text-center relative">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                <span class="text-xl font-bold text-white">4</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p class="text-gray-600">
                Monitor your improvement over time with detailed analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <!-- <section class="py-16 sm:py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Student Success Stories</h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            See how our platform has helped students improve their SAT scores.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
            <div class="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon icon="lucide:quote" class="w-4 h-4 text-white" />
            </div>
            <p class="text-gray-600 mb-6 italic">
              "This platform helped me improve my SAT score by 150 points! The detailed explanations for each question were incredibly helpful."
            </p>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-blue-600 font-semibold">JL</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Jessica L.</h4>
                <p class="text-sm text-gray-500">Score improved from 1320 to 1470</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
            <div class="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Icon icon="lucide:quote" class="w-4 h-4 text-white" />
            </div>
            <p class="text-gray-600 mb-6 italic">
              "The wrong questions review feature helped me identify and focus on my weak areas. My math score improved dramatically!"
            </p>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-purple-600 font-semibold">MT</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Michael T.</h4>
                <p class="text-sm text-gray-500">Score improved from 1280 to 1400</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative">
            <div class="absolute -top-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Icon icon="lucide:quote" class="w-4 h-4 text-white" />
            </div>
            <p class="text-gray-600 mb-6 italic">
              "I love how the platform adapts to my learning style. The practice sessions are focused and efficient, saving me hours of study time."
            </p>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-green-600 font-semibold">AK</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Aisha K.</h4>
                <p class="text-sm text-gray-500">Score improved from 1350 to 1520</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden opacity-20">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-3xl sm:text-4xl font-bold mb-6">Ready to Improve Your SAT Score?</h2>
        <p class="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
          Join thousands of students who have improved their scores with our platform. Start practicing today!
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link 
            to="/practice" 
            class="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center"
          >
            <Icon icon="lucide:play" class="mr-2 w-5 h-5" />
            Start Free Practice
          </router-link>
          
          <button 
            @click="$emit('show-wrong-questions')"
            class="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-300 flex items-center justify-center"
          >
            <Icon icon="lucide:x-circle" class="mr-2 w-5 h-5" />
            Review Wrong Questions
          </button>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <!-- <section class="py-16 sm:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-gray-600">
            Find answers to common questions about our SAT practice platform.
          </p>
        </div>
        
        <div class="space-y-6">
          <div v-for="(faq, index) in faqs" :key="index" class="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <h3 class="text-xl font-semibold text-gray-900 mb-3 flex items-start">
              <Icon icon="lucide:help-circle" class="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>{{ faq.question }}</span>
            </h3>
            <p class="text-gray-600 ml-8">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section> -->
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Define emits for parent component communication
defineEmits(['show-wrong-questions'])

// FAQ data
// const faqs = [
//   {
//     question: "Is this platform completely free?",
//     answer: "Yes, our SAT practice platform is 100% free to use. We believe in making quality test preparation accessible to all students."
//   },
//   {
//     question: "Where do the practice questions come from?",
//     answer: "All questions are sourced from official College Board practice tests and materials, ensuring they accurately reflect the format and difficulty of the actual SAT."
//   },
//   {
//     question: "How often are new questions added?",
//     answer: "We regularly update our question bank with new official questions as they become available from the College Board."
//   },
//   {
//     question: "Can I use this platform on my mobile device?",
//     answer: "Yes, our platform is fully responsive and works on desktops, tablets, and mobile phones, allowing you to practice anywhere."
//   }
// ]

const trackStartPractice = () => {
    // 确保 umami 对象已加载
    if (window.umami) {
      window.umami.track('StartPracticing', { category: 'Navigation', label: 'Home CTA' });
    }
  }
</script>

<style scoped>
/* Blob animation */
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>