import { OrganizationList } from '@clerk/nextjs';

const ManageOrganizationPage = () => {
  return (
    <div>
      <OrganizationList
        afterCreateOrganizationUrl="/organization/:id"
        afterSelectOrganizationUrl="/organization/:id"
        hidePersonal
      />
    </div>
  );
};

export default ManageOrganizationPage;
