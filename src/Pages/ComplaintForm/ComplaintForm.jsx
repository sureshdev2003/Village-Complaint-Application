import { useParams } from 'react-router-dom';
import "./ComplaintForm.css"
const ComplaintForm = () => {
  const { category } = useParams();

  return (
    <div>
      <h2>Complaint Form for: {category.replace(/-/g, " ")}</h2>
      {/* Add your form here */}
    </div>
  );
};

export default ComplaintForm;
