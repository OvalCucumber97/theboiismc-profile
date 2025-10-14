// Edit Profile Button
document.querySelector('.bg-blue-600').addEventListener('click', () => {
  alert("You can integrate your backend here for profile editing.");
});

// Settings Form Submission
document.querySelector('#settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  alert(`Settings updated: Name: ${name}, Email: ${email}`);
  // Replace with API call to update settings in your backend
});
