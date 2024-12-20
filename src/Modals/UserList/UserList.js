import { VStack } from '@chakra-ui/react';
import React from 'react'

const UserList = ({children}) => {
  return (
    <VStack mt={5} display="flex" w="100%">
        {children}
    </VStack>
  );
}

export default UserList
