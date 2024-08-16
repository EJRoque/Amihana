import React from 'react'

const BalanceSheetSection = () => {
      // pagawa po functional date ng balance sheet ty 💓
      return (
            <>
                  <div className='bg-[#E9F5FE] rounded-2xl flex flex-col gap-4 m-2 phone:p-2 phone:m-1 phone:text-sm'>

                        <h2 className='laptop:text-xl desktop:text-2xl font-bold mx-2'>Butaw Collection and HOA Membership</h2>


                        <div class="flex w-full">
                              <div class="w-full">
                                    <table class="w-full bg-white table-auto">
                                          <thead>
                                                <tr className="bg-gray-300 text-left">
                                                      <th class="border-2 border-black px-4 py-2">Month</th>
                                                      <th class="border-2 border-black px-4 py-2">Status</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">January</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">February</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">March</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">April</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">May</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">June</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">July</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">August</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">September</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">October</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">November</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2">December</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                                <tr>
                                                      <td class="border-2 border-black px-4 py-2 bg-blue-500 text-white">HOA Membership</td>
                                                      <td class="border-2 border-black px-4 py-2">Paid</td>
                                                </tr>
                                          </tbody>
                                    </table>
                              </div>
                              <div class="w-30"></div>
                        </div>


                  </div>
            </>
      )
}

export default BalanceSheetSection