class User {
  constructor({
    id,
    name,
    email,
    password,
    role,
    registration_date = new Date().toISOString(),
    location = "",
    company_name = null,
    company_description = null,
    company_website = null,
    company_size = null,
    linkedin = null,
    image = null,
    cv_url = "",
    experience = 0,
    skills = "",
    technology = [],
    isProfileComplete = false
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.registration_date = registration_date;
    this.location = location;
    this.company_name = company_name;
    this.company_description = company_description;
    this.company_website = company_website;
    this.company_size = company_size;
    this.linkedin = linkedin;
    this.image = image;
    this.cv_url = cv_url;
    this.experience = experience;
    this.skills = skills;
    this.technology = technology;
    this.isProfileComplete = isProfileComplete;
  }
}

module.exports = User;
